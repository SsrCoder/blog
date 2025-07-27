---
title: Redis 实现 Message Queue
pubDate: 2025-07-23
tags: ["Redis", "Message Queue", "PubSub", "Redis Streams", "Redis ZSet"]
# image:
#     url: ''
#     alt: ''
---

# 目录

# PUBSUB

## 订阅

会把KV存储到 server.pubsub_channels / server.pubsubshard_channels 中，其中K是 channel，而V是客户端数组

使用 `SUBSCRIBE <channel>` 精确订阅频道

```c
/* Subscribe a client to a channel. Returns 1 if the operation succeeded, or
 * 0 if the client was already subscribed to that channel. */
int pubsubSubscribeChannel(client *c, robj *channel, pubsubtype type) {
    dictEntry *de, *existing;
    dict *clients = NULL;
    int retval = 0;
    unsigned int slot = 0;

    /* Add the channel to the client -> channels hash table */
    void *position = dictFindPositionForInsert(type.clientPubSubChannels(c),channel,NULL);
    if (position) { /* Not yet subscribed to this channel */
        retval = 1;
        /* Add the client to the channel -> list of clients hash table */
        if (server.cluster_enabled && type.shard) {
            slot = getKeySlot(channel->ptr);
        }

        de = kvstoreDictAddRaw(*type.serverPubSubChannels, slot, channel, &existing);

        if (existing) {
            clients = dictGetVal(existing);
            channel = dictGetKey(existing);
        } else {
            clients = dictCreate(&clientDictType);
            kvstoreDictSetVal(*type.serverPubSubChannels, slot, de, clients);
            incrRefCount(channel);
        }

        serverAssert(dictAdd(clients, c, NULL) != DICT_ERR);
        serverAssert(dictInsertAtPosition(type.clientPubSubChannels(c), channel, position));
        incrRefCount(channel);
    }
    /* Notify the client */
    addReplyPubsubSubscribed(c,channel,type);
    return retval;
}
```

使用 `PSUBSCRIBE <channel>...` 订阅带通配符的频道

```c
/* Subscribe a client to a pattern. Returns 1 if the operation succeeded, or 0 if the client was already subscribed to that pattern. */
int pubsubSubscribePattern(client *c, robj *pattern) {
    dictEntry *de;
    dict *clients;
    int retval = 0;

    if (dictAdd(c->pubsub_patterns, pattern, NULL) == DICT_OK) {
        retval = 1;
        incrRefCount(pattern);
        /* Add the client to the pattern -> list of clients hash table */
        de = dictFind(server.pubsub_patterns,pattern);
        if (de == NULL) {
            clients = dictCreate(&clientDictType);
            dictAdd(server.pubsub_patterns,pattern,clients);
            incrRefCount(pattern);
        } else {
            clients = dictGetVal(de);
        }
        serverAssert(dictAdd(clients, c, NULL) != DICT_ERR);
    }
    /* Notify the client */
    addReplyPubsubPatSubscribed(c,pattern);
    return retval;
}
```

## 发布

```c
/*
 * Publish a message to all the subscribers.
 */
int pubsubPublishMessageInternal(robj *channel, robj *message, pubsubtype type) {
    int receivers = 0;
    dictEntry *de;
    dictIterator *di;
    unsigned int slot = 0;

    /* Send to clients listening for that channel */
    if (server.cluster_enabled && type.shard) {
        slot = keyHashSlot(channel->ptr, sdslen(channel->ptr));
    }
    de = kvstoreDictFind(*type.serverPubSubChannels, slot, channel);
    if (de) {
        dict *clients = dictGetVal(de);
        dictEntry *entry;
        dictIterator *iter = dictGetIterator(clients);
        while ((entry = dictNext(iter)) != NULL) {
            client *c = dictGetKey(entry);
            addReplyPubsubMessage(c,channel,message,*type.messageBulk);
            updateClientMemUsageAndBucket(c);
            receivers++;
        }
        dictReleaseIterator(iter);
    }

    if (type.shard) {
        /* Shard pubsub ignores patterns. */
        return receivers;
    }

    /* Send to clients listening to matching channels */
    di = dictGetIterator(server.pubsub_patterns);
    if (di) {
        channel = getDecodedObject(channel);
        while((de = dictNext(di)) != NULL) {
            robj *pattern = dictGetKey(de);
            dict *clients = dictGetVal(de);
            if (!stringmatchlen((char*)pattern->ptr,
                                sdslen(pattern->ptr),
                                (char*)channel->ptr,
                                sdslen(channel->ptr),0)) continue;

            dictEntry *entry;
            dictIterator *iter = dictGetIterator(clients);
            while ((entry = dictNext(iter)) != NULL) {
                client *c = dictGetKey(entry);
                addReplyPubsubPatMessage(c,pattern,channel,message);
                updateClientMemUsageAndBucket(c);
                receivers++;
            }
            dictReleaseIterator(iter);
        }
        decrRefCount(channel);
        dictReleaseIterator(di);
    }
    return receivers;
}
```

### 模式匹配

```c
/* Glob-style pattern matching. */
static int stringmatchlen_impl(const char *pattern, int patternLen,
        const char *string, int stringLen, int nocase, int *skipLongerMatches, int nesting)
{
    /* Protection against abusive patterns. */
    if (nesting > 1000) return 0;

    while(patternLen && stringLen) {
        switch(pattern[0]) {
        case '*':
            while (patternLen && pattern[1] == '*') {
                pattern++;
                patternLen--;
            }
            if (patternLen == 1)
                return 1; /* match */
            while(stringLen) {
                if (stringmatchlen_impl(pattern+1, patternLen-1,
                            string, stringLen, nocase, skipLongerMatches, nesting+1))
                    return 1; /* match */
                if (*skipLongerMatches)

                string++;
                stringLen--;
            }
            /* There was no match for the rest of the pattern starting
             * from anywhere in the rest of the string. If there were
             * any '*' earlier in the pattern, we can terminate the
             * search early without trying to match them to longer
             * substrings. This is because a longer match for the
             * earlier part of the pattern would require the rest of the
             * pattern to match starting later in the string, and we
             * have just determined that there is no match for the rest
             * of the pattern starting from anywhere in the current
             * string. */
            *skipLongerMatches = 1;
            return 0; /* no match */
            break;
        case '?':
            string++;
            stringLen--;
            break;
        case '[':
        {
            int not, match;

            pattern++;
            patternLen--;
            not = patternLen && pattern[0] == '^';
            if (not) {
                pattern++;
                patternLen--;
            }
            match = 0;
            while(1) {
                if (patternLen >= 2 && pattern[0] == '\\') {
                    pattern++;
                    patternLen--;
                    if (pattern[0] == string[0])
                        match = 1;
                } else if (patternLen == 0) {
                    pattern--;
                    patternLen++;
                    break;
                } else if (pattern[0] == ']') {
                    break;
                } else if (patternLen >= 3 && pattern[1] == '-') {
                    int start = pattern[0];
                    int end = pattern[2];
                    int c = string[0];
                    if (start > end) {
                        int t = start;
                        start = end;
                        end = t;
                    }
                    if (nocase) {
                        start = tolower(start);
                        end = tolower(end);
                        c = tolower(c);
                    }
                    pattern += 2;
                    patternLen -= 2;
                    if (c >= start && c <= end)
                        match = 1;
                } else {
                    if (!nocase) {
                        if (pattern[0] == string[0])
                            match = 1;
                    } else {
                        if (tolower((int)pattern[0]) == tolower((int)string[0]))
                            match = 1;
                    }
                }
                pattern++;
                patternLen--;
            }
            if (not)
                match = !match;
            if (!match)
                return 0; /* no match */
            string++;
            stringLen--;
            break;
        }
        case '\\':
            if (patternLen >= 2) {
                pattern++;
                patternLen--;
            }
            /* fall through */
        default:
            if (!nocase) {
                if (pattern[0] != string[0])
                    return 0; /* no match */
            } else {
                if (tolower((int)pattern[0]) != tolower((int)string[0]))
                    return 0; /* no match */
            }
            string++;
            stringLen--;
            break;
        }
        pattern++;
        patternLen--;
        if (stringLen == 0) {
            while(patternLen && *pattern == '*') {
                pattern++;
                patternLen--;
            }
            break;
        }
    }
    if (patternLen == 0 && stringLen == 0)
        return 1;
    return 0;
}
```

## Keyspace Notification

keyspace notification 只是一个特殊的 Pub/Sub 频道，当 redis 执行一些修改操作时会往对应频道内写入数据

其中的type和event：

- generic:
  - del
  - rename_from
  - rename_to
  - move_from
  - move_to
  - copy_to
- string:
  - set
  - setbit
  - append
  - incrbyfloat
  - incrby
  - setrange
  - pfadd
- list:
  - linsert
  - lset
  - lpush
  - rpush
  - lpop
  - rpop
  - ltrim
  - lrem

TODO: add others

type:

```c
#define NOTIFY_GENERIC (1<<2)     /* g */
#define NOTIFY_STRING (1<<3)      /* $ */
#define NOTIFY_LIST (1<<4)        /* l */
#define NOTIFY_SET (1<<5)         /* s */
#define NOTIFY_HASH (1<<6)        /* h */
#define NOTIFY_ZSET (1<<7)        /* z */
#define NOTIFY_EXPIRED (1<<8)     /* x */
#define NOTIFY_EVICTED (1<<9)     /* e */
#define NOTIFY_STREAM (1<<10)     /* t */
#define NOTIFY_KEY_MISS (1<<11)   /* m (Note: This one is excluded from NOTIFY_ALL on purpose) */
#define NOTIFY_LOADED (1<<12)     /* module only key space notification, indicate a key loaded from rdb */
#define NOTIFY_MODULE (1<<13)     /* d, module key space notification */
#define NOTIFY_NEW (1<<14)        /* n, new key notification */
```

其事件包括：

- new: 创建 key

```c
/* The API provided to the rest of the Redis core is a simple function:
 *
 * notifyKeyspaceEvent(int type, char *event, robj *key, int dbid);
 *
 * 'type' is the notification class we define in `server.h`.
 * 'event' is a C string representing the event name.
 * 'key' is a Redis object representing the key name.
 * 'dbid' is the database ID where the key lives.  */
void notifyKeyspaceEvent(int type, const char *event, robj *key, int dbid) {
    sds chan;
    robj *chanobj, *eventobj;
    int len = -1;
    char buf[24];

    /* If any modules are interested in events, notify the module system now.
     * This bypasses the notifications configuration, but the module engine
     * will only call event subscribers if the event type matches the types
     * they are interested in. */
     moduleNotifyKeyspaceEvent(type, event, key, dbid);

    /* If notifications for this class of events are off, return ASAP. */
    if (!(server.notify_keyspace_events & type)) return;

    eventobj = createStringObject(event,strlen(event));

    /* __keyspace@<db>__:<key> <event> notifications. */
    if (server.notify_keyspace_events & NOTIFY_KEYSPACE) {
        chan = sdsnewlen("__keyspace@",11);
        len = ll2string(buf,sizeof(buf),dbid);
        chan = sdscatlen(chan, buf, len);
        chan = sdscatlen(chan, "__:", 3);
        chan = sdscatsds(chan, key->ptr);
        chanobj = createObject(OBJ_STRING, chan);
        pubsubPublishMessage(chanobj, eventobj, 0);
        decrRefCount(chanobj);
    }

    /* __keyevent@<db>__:<event> <key> notifications. */
    if (server.notify_keyspace_events & NOTIFY_KEYEVENT) {
        chan = sdsnewlen("__keyevent@",11);
        if (len == -1) len = ll2string(buf,sizeof(buf),dbid);
        chan = sdscatlen(chan, buf, len);
        chan = sdscatlen(chan, "__:", 3);
        chan = sdscatsds(chan, eventobj->ptr);
        chanobj = createObject(OBJ_STRING, chan);
        pubsubPublishMessage(chanobj, key, 0);
        decrRefCount(chanobj);
    }
    decrRefCount(eventobj);
}
```

# STREAMS

# LIST

# ZSET
