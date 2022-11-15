# Grasscutter 指令助手

[English](https://github.com/Dituon/grasscutter-command-helper/blob/main/README.md) | 简体中文

> **Warning**
> 本项目采用 [`AGPL-3.0`协议](https://github.com/Dituon/grasscutter-command-helper/blob/main/LICENSE) 开源, 必须保留本项目版权信息, 禁止倒卖

## 前言

原 `Xmmt 指令生成器`, 重构后开源

纯 `JS(ES)` 编写, 模块化设计: 轻量, 高效

本项目所有数据均由脚本自动分类, 有错误欢迎提交 `pr/issue`

此框架可用于其它 游戏/软件 指令生成

## 链接

[Discord](https://discord.gg/Dxw5BVTN)

[QQ群](https://jq.qq.com/?_wv=1027&k=wPwRuhuJ)

## 功能

- 指令生成, 版本切换

- 指令分类, 保存, 分享, 导入

- 远程执行, 账户绑定

- 多语言支持

## 部署

1. `git -clone`

2. 配置 `Nginx`, 反向代理 `/opencommand``/status` , 通过 `Header/reqip` 指定目标转发服务器

## 构建/更新 数据

参见 `/builder/`, 需要 `NodeJS` 环境

## 后话

欢迎提交任何请求
