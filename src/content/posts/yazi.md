---
title: 'Yazi: 111'
published: 2024-12-24
description: A Lua Quick Start.
tags: [Lua]
category: Lua
draft: true
---

Yazi 是一款终端的文件管理器

[Github](https://github.com/sxyazi/yazi?tab=readme-ov-file)


# 安装

```shell
brew install yazi # ffmpeg sevenzip jq poppler fd ripgrep fzf zoxide imagemagick font-symbols-only-nerd-font
```

yazi 的 TUI 默认启动命令是 `yazi`，而我们可以在 `~/.zshrc` 中配置以下函数来通过 `y` 激活 yazi

```shell
function y() {
	local tmp="$(mktemp -t "yazi-cwd.XXXXXX")" cwd
	yazi "$@" --cwd-file="$tmp"
	if cwd="$(command cat -- "$tmp")" && [ -n "$cwd" ] && [ "$cwd" != "$PWD" ]; then
		builtin cd -- "$cwd"
	fi
	rm -f -- "$tmp"
}
```

当你按 `q` 退出时你会发现