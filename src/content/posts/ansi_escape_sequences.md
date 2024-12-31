---
title: Neovim 与 ANSI 转义序列
published: 2025-01-01
description: 这篇文章
tags: [Lua]
category: Lua
draft: true
---

## 起因
在我给我的 Neovim 配置快捷键的时候(Windows Terminal)，我希望在 Normal Mode 下，按下 `<Tab>` 和 `<S-Tab>` 键，就可以切换我的 Buffer，所以我配置了以下代码：

```lua
vim.keymap.set('n', '<Tab>', ':bnext<CR>', opts)
vim.keymap.set('n', '<S-Tab>', ':bprevious<CR>', opts)
```

添加保存重启，我发现这个配置工作的很好，但是，在我阅读代码时，发现我的 `<C-i>` 键无法正常工作。

众所周知，vim 的 Normal Mode 下，`<C-o>` 和 `<C-i>` 键用于将光标跳转到光标的上一个/下一个位置。

而我的 `<C-i>` 的行为看起来很奇怪，反复试验后发现他的行为是跳到了下一个 Buffer，所以我十分怀疑是我 map 的 `<Tab>` 键有问题，所以我尝试将其注释掉后，问题确实解决了。

查看 vim 的帮助手册 `:h CTRL-I` 可以看到如下内容：
```plaintext
<Tab>		or					*CTRL-I* *<Tab>*
CTRL-I			Go to [count] newer cursor position in jump list
			(not a motion command).

			NOTE: In the GUI and in a terminal supporting
			|tui-modifyOtherKeys| or |tui-csiu|, CTRL-I can be
			mapped separately from <Tab>, on the condition that
			both keys are mapped, otherwise the mapping applies to
			both.
```

这段话的意思是，如果一个终端支持 `tui-modifyOtherKeys` 或者 `tui-csiu`，那么就可以将 `<C-i>` 与 `<Tab>` 键的映射分开，否则，映射会同时在两个 key 生效。

而我进一步尝试了解 `tui-modifyOtherKeys` 和 `tui-csiu`，使用 `:h tui-modifyOtherKeys`，帮助文档给出了如下内容：

```plaintext
						*tui-modifyOtherKeys* *tui-csiu*
At startup Nvim will query your terminal to see if it supports the "CSI u"
encoding by writing the sequence >
	CSI ? u CSI c
If your terminal emulator responds with >
	CSI ? <flags> u
this means your terminal supports the "CSI u" encoding and Nvim will tell your
terminal to enable it by writing the sequence >
	CSI > 1 u
If your terminal does not support "CSI u" then Nvim will instead enable the
"modifyOtherKeys" encoding by writing the sequence >
	CSI > 4 ; 2 m

When Nvim exits cleanly it will send the corresponding sequence to disable the
special key encoding. If Nvim does not exit cleanly then your terminal
emulator could be in a bad state. If this happens, simply run "reset".
```

大致是说 neovim 会尝试查询终端是否支持 csi u 编码序列，如果支持则使用，否则就使用 modify other keys 的方式编码


## 编码序列

### ANSI

[ANSI escape code](https://en.wikipedia.org/wiki/ANSI_escape_code)


### CSI u

[CSI U Document](https://www.leonerd.org.uk/hacks/fixterms/)


### Modify Other Keys

[Modify Other Keys Document](https://invisible-island.net/xterm/modified-keys.html)
