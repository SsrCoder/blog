---
title: Tmux 终端复用工具
date: 2022-08-26 15:04:24
updated: 2022-08-26 15:04:24
tags:
  - tmux
description: Tmux 是一款终端复用工具，它可以在一个终端窗口中开启多个终端，管理终端的布局，以及方便的切换工作区。
---

[Tmux](https://github.com/tmux/tmux) 是一款终端复用工具，它可以在一个终端窗口中开启多个终端，管理终端的布局，以及方便的切换工作区

## 快速上手

### 安装

{% tabs install %}
<!-- tab BSD -->
```shell
sudo apt install -y tmux
```
 <!-- endtab -->
<!-- tab MacOS -->
```shell
brew install tmux
```
 <!-- endtab -->
{% endtabs %}

### 创建一个会话

```shell
tmux
```

![新建 tmux 会话](https://sbi.ssrcoder.com/1661248915621.png)

我们可以很明显的看到终端最下方有一个状态栏，状态栏中有个 0:bash 代表当前窗口正在运行的命令，这个状态栏可以展示很多信息（包括主机名、正在运行的命令、时间、电池电量等），可以在配置中自定义

可以在这个窗口中运行一个 top 命令

### 新建窗口

在 tmux 中按 `Ctrl-b + c` 可以新建一个窗口

![新建窗口](https://sbi.ssrcoder.com/1661249299863.png)

这里状态栏中间部分变成 `0:top- 1:bash*`，表示我们当前焦点在 1 这个窗口上，并且运行这 bash 命令，其中 `*` 表示当前正在展示的窗口，其他窗口则用 `-` 表示

可以在这个窗口里运行一个 vim

### 窗口切换

可以按 `Ctrl-b + <number>` 切换到指定编号的窗口

也可以按 `Ctrl-b + n` 切换下一个窗口，`Ctrk-b + p` 切换上一个窗口

### 创建窗格

在一个窗口中，可以创建多个窗格

可以按 `Ctrl-b + %` 将当前窗格分成左右两份，按 `Ctrl-b + "` 将当前窗格分成上下两份

![划分窗格](https://sbi.ssrcoder.com/1661249687748.png)

### 切换窗格焦点

在上面的图中可以看到，正在获取焦点的窗格周围会显示绿框，可以按 `Ctrl-b <up>` 切换焦点到上面的窗格，同理焦点切换到下、左、右的窗格也一样

![切换焦点](https://sbi.ssrcoder.com/1661249911929.png)

### 关闭

就像在普通的终端中一样，输入 `exit` 或者按 `Ctrl-d` 键即可退出终端，当终端关闭时，其所在的窗格也会关闭，当窗口里的最后一个窗格关闭时，窗口也会关闭，当最后一个窗口关闭时，会话也会关闭

## Tmux 的优点

可能你会觉得 tmux 只是在一个终端上多开几个格子而已，iTerm2 也可以做到，那么我这里就来列一下选择 tmux 的原因：

1. tmux 是跨平台的，无论是在 MacOS 还是 Linux，或者 Codespaces 等云上开发环境，tmux 的操作都是一致的，而终端在不同的操作系统以及发行版本中都不太一样
2. tmux 的定制性强，你可以通过配置文件修改成你想要的样子，包括快捷键、主题、操作方法等
3. tmux 可以后台保留程序，tmux 内部的程序运行是与终端链接脱离的，可以在你断开链接后仍继续执行命令，很适合远程链接经常容易断开或者有后台任务的情况

## 前缀键

在 tmux 中，快捷键通常以 `Ctrl-b` 开头，这个被称为 `前缀键(PREFIX KEY)`，这个键可以修改，我们会在后面配置章节提到修改前缀键的方法

后面的内容中以 `PREFIX` 表示前缀键

## 会话、窗口、窗格

tmux 是一个 service-client 模式程序，其中的会话、窗口、窗格以及其中运行的命令都是运行在 tmux server 之上的，我们终端中展示的只是一个 tmux client

![tmux 组成结构](https://sbi.ssrcoder.com/1661494518464.png)

在 tmux 中，可以使用 `PREFIX + s` 来查看和切换 tmux 会话、窗口、窗格

![tmux 切换](https://sbi.ssrcoder.com/1661495042955.png)

### 会话

在执行 `tmux` 时，会默认创建一个会话，会话是一组 tmux 窗口的集合，通常我们会把一类任务放到一个会话中

#### 工作目录

在创建 tmux 会话时，终端所在的目录将会作为 tmux 会话的工作目录，后面在这个会话中新打开的窗格都会默认进入这个工作目录

#### 会话命名

在 tmux 窗口的状态栏最前面是当前会话的名称，可以在创建会话时通过 `tmux new-session -s <name>` 指定

对于一个已经创建好的会话，可以使用 `tmux rename-session -t <old> <new>` 修改会话名

#### 脱离和附加

有时你可能希望暂时将 tmux 挂在后台上，在终端中执行一些操作，这时可以使用 `Ctrl-b d` 来脱离 tmux 窗口。

在你执行完需要的操作后，可以使用 `tmux attach-session -t <session>` 来恢复之前的tmux 窗口

### 窗口

tmux 的一个窗口会占用一整个终端页面，所以通常会把一些希望在用一个页面展示的内容放在同一个窗口中，比如：窗口的一个窗格执行脚本，一个窗格查看top命令，一个窗格编辑文件

一些常用的操作快捷键如下：

- `PREFIX + c`：创建窗口
- `PREFIX + x`：关闭窗口
- `PREFIX + ,`：重命名窗口
- `PREFIX + n`: 查看下一个窗口
- `PREFIX + p`：查看上一个窗口
- `PREFIX + <number>`：查看指定索引的窗口

### 窗格

tmux 的每个窗格上运行这一个 shell 程序

一些常用的操作快捷键如下：

- `PREFIX + %`：左右分割窗格
- `PREFIX + "`：上下分割窗格
- `PREFIX + <space>`：切换窗格布局
- `PREFIX + o`：切换到下一个窗格
- `PREFIX + z`: 切换全窗口展示，再次按下恢复
- `PREFIX + q + <number>`： 切换指定索引的窗格

## 配置

你可以在 `~/.tmux.conf` 中配置你的 tmux，在 tmux 服务器启动时，会自动载入该文件

你也可以在启动 tmux 时指定要使用的配置文件 `tmux -f <config_file>`

当你正在 tmux 中，并且修改了 `tmux.conf`，需要重启 tmux 才能重新载入，你也可以使用 `PREFIX + :` 进入命令行模式，输入 `source-file <config_file>` 立即生效配置文件

![载入配置文件](https://sbi.ssrcoder.com/1661312582213.png)

### 修改前缀键

tmux 默认的前缀键是 `Ctrl-b` 但是 `Ctrl` 键和 `b` 键距离较远，比较难按，所以通常 tmux 用户都会将前缀键映射成 `Ctrl-a` 键

```conf
set -g prefix C-a
unbind C-b
```

### 载入配置文件

载入配置文件需要输入 `source-file <config_file>`，比较难记，可以映射一个快捷键来重新载入配置文件

```conf
bind C-r source-file ~/.tmux.conf \; display "Tmux Config Reloaded!"
```

刚配置完第一次载入还是需要手动输入的，但是之后就可以按下 `PREFIX + Ctrl-r` 即可重新载入配置文件

### 切换窗格

默认情况下，tmux 使用前缀键 + 方向键切换窗格，但是作为一个 vim 用户，你肯能更习惯用 hjkl 切换，可以将切换窗格绑定到 hjkl 上

```conf
bind-key k select-pane -U
bind-key j select-pane -D
bind-key h select-pane -L
bind-key l select-pane -R
```

如果你不想按前缀键，也可以试试如下操作，按 Meta 键 + hjkl 键切换，Meta 键在 Windows、Linux 上是 Alt 键，在 MacOS 上可以用 Option 键配置

```conf
bind-key -n M-k select-pane -U
bind-key -n M-j select-pane -D
bind-key -n M-h select-pane -L
bind-key -n M-l select-pane -R
```

MacOS 上开启 Option 为 Meta 键的方法：

iTerm2：
![iTerm2 Option 改为 Meta](https://sbi.ssrcoder.com/1661322344798.png)

VSCode:
![iTerm2 Option 改为 Meta](https://sbi.ssrcoder.com/1661322444662.png)

### 开启鼠标操作

有时候你可能希望直接用鼠标操作你的 tmux，切换窗口，切换窗格或者滚动屏幕等，可以开启鼠标操作功能：

```conf
set -g mouse on
```

### 开启剪切板

如果你希望在 tmux 中修改你的剪切板，可以进行如下配置

```conf
set -g set-clipboard on
```

### 修改默认 Shell

tmux 的默认 shell 是用的启动时环境变量中 `$SHELL`，你可以在配置文件中指定使用哪个 shell 来操作

```conf
set -g default-shell /bin/zsh
```

### 取消 Esc 键延迟

你可能会发现，在 tmux 中使用 Esc 键会有一个延迟，尤其是在 vim 中很明显，可以设置将 Esc 键延迟取消

```conf
set -s escape-time 0
```

### 开启 256 色支持

如果你的终端支持 256 色显示，你可能希望你的 tmux 也支持，那么就需要进行如下设置

```conf
set -g default-terminal "screen-256color"
set-option -ga terminal-overrides ",*256col*:Tc"
```

### 索引从 1 开始

切换窗口和窗格时需要使用索引，而索引从 0 开始，距离左 Ctrl 键较远，所以将索引设置为从 1 开始会好很多

```conf
set -g base-index 1
set -g pane-base-index 1
```

## 插件

你可以在 [tmux-plugins](https://github.com/tmux-plugins) 查看更多 tmux 插件

### tpm

在 tmux 中使用插件一般使用 tpm 管理

首先需要安装插件：

```shell
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm
```

在配置文件中开启 tpm

```conf
# List of plugins
set -g @plugin 'tmux-plugins/tpm'

# Initialize TMUX plugin manager (keep this line at the very bottom of tmux.conf)
run '~/.tmux/plugins/tpm/tpm'
```

这样 tpm 就配置好了，在使用其他插件时，只需要将插件添加到 `run '~/.tmux/plugins/tpm/tpm'` 这行之前，重新载入配置文件，按 `PREFIX + I` 即可安装插件了

### nord-tmux

Nord 主题

```conf
set -g @plugin "arcticicestudio/nord-tmux"
```

![nord-tmux](https://sbi.ssrcoder.com/1661326141653.png)

### tmux-resurrect

`tmux-resurrect` 插件用于保存当前会话信息，可以在需要时恢复

```conf
set -g @plugin 'tmux-plugins/tmux-resurrect'
```

- `PREFIX + S`：保存会话信息
- `PREFIX + R`：恢复会话

### tmux-continuum

`tmux-continuum` 插件依赖 `tmux-resurrect` 插件，可以帮助我们定时的保存会话信息，默认是 15 分钟保存一次

```conf
set -g @plugin 'tmux-plugins/tmux-continuum'
```

## 完整配置

```conf
# remap prefix key
set -g prefix C-a
unbind C-b

# reload config file
bind C-r source-file ~/.tmux.conf \; display "Tmux Config Reloaded!"

# enable mouse
set -g mouse on

# select pane by hjkl
bind-key k select-pane -U
bind-key j select-pane -D
bind-key h select-pane -L
bind-key l select-pane -R

# select pane by Meta + hjkl
bind-key -n M-k select-pane -U
bind-key -n M-j select-pane -D
bind-key -n M-h select-pane -L
bind-key -n M-l select-pane -R

# open set clipboard
set -g set-clipboard on

# set default shell
set -g default-shell /bin/zsh

# disable escape delay
set -s escape-time 0

# enable 256color
set -g default-terminal "screen-256color"
set-option -ga terminal-overrides ",*256col*:Tc"

# index start from 1
set -g base-index 1
set -g pane-base-index 1

# List of plugins
set -g @plugin 'tmux-plugins/tpm'

set -g @plugin "arcticicestudio/nord-tmux"

set -g @plugin 'tmux-plugins/tmux-resurrect'
set -g @plugin 'tmux-plugins/tmux-continuum'

# Initialize TMUX plugin manager (keep this line at the very bottom of tmux.conf)
run '~/.tmux/plugins/tpm/tpm'
```

## 参考资料

- [A Quick and Easy Guide to tmux](https://www.hamvocke.com/blog/a-quick-and-easy-guide-to-tmux/)
- [Making tmux Pretty and Usable - A Guide to Customizing your tmux.conf](https://www.hamvocke.com/blog/a-guide-to-customizing-your-tmux-conf/)
- [Everything you need to know about tmux – Panes](https://arcolinux.com/everthing-you-need-to-know-about-tmux-panes/)
