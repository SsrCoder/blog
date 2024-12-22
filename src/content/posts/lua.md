---
title: Lua Quick Start
published: 2024-12-20
description: A Lua Quick Start.
tags: [Lua]
category: Lua
draft: true
---

https://wiki.luatos.com/_static/luatos-emulator/lua.html

## 数据类型

### 数字 number
数字类型存储的是双精度浮点数

```lua
num1 = 100
num2 = 3.14
num3 = 0xFF00FF
num4 = 2e5
num5 = tonumber('123.4')

print(type(num1), num1, num2, num3, num4, num5)
```

### 字符串 string

```lua
str1 = "hello"
str2 = 'lua'
str3 = [[
    multi
    line
    text
]]
str4 = '3.14'
str5 = tostring(5)

print(type(str1), str2, str3, str4, str5)

print(str1 .. ', ' .. str2) -- 字符串拼接
print(str4 + str5) -- 算数运算时会把 string 类型转换成 number 类型
print(str4 * str5 * str5)
-- print(str1 + str2) -- 无法转换则报错
print('len(str1)', #str1)
```
