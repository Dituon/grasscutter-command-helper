# Grasscutter 指令助手

[English](https://github.com/Dituon/grasscutter-command-helper/blob/main/README.md) | 简体中文

> **Warning**
>
> 本项目采用 [`AGPL-3.0`协议](https://github.com/Dituon/grasscutter-command-helper/blob/main/LICENSE) 开源, 必须保留本项目版权信息, 禁止倒卖
>
> (你可以随意更改任何内容, 但请一定保留本项目 `Github` 链接)

## [Demo](https://cmd.d2n.moe/new)

## 前言

原 `Xmmt 指令生成器`, 重构后开源

纯 `JS(ES)` 编写, 模块化设计: 轻量, 高效

本项目所有数据均由脚本自动分类, 有错误欢迎提交 `pr/issue`

此框架可用于其它 游戏/软件 指令生成

## 链接

[Discord](https://discord.gg/uDSQfQTrd8)

[QQ群](https://jq.qq.com/?_wv=1027&k=wPwRuhuJ)

## 功能

- 指令生成, 版本切换

- 指令分类, 保存, 分享, 导入

- 远程执行, 账户绑定 (需要 [OpenCommand 插件](https://github.com/jie65535/gc-opencommand-plugin))

- 多语言支持

## GET参数

脚本会解析`URL`中的`GET`参数, 可以向用户提供一些默认值

| 参数      | 值域                      | 说明       |
| --------- | ------------------------- | ---------- |
| `version` | `1.2.1` `1.4.2`           | 指令版本   |
| `lang`    | `navigator.language`      | 语言       |
| `server`  | `encodeURIComponent(URL)` | 远程服务器 |
| `import`  | `encodeURIComponent(URL)` | 导入指令   |

**示例**

> `https://cmd.d2n.moe/new?version=1.4.2&server=https%3A%2F%2Fgenshinserver.xmmt.fun%3A25568`
> 
> 指令版本为`1.4.2`, 服务器地址为`https://genshinserver.xmmt.fun:25568`

> `https://cmd.d2n.moe/new?lang=zh-CN&import=./share/artifact.gmh`
>
> 语言为`中文`, 从`/share/artifact.gmh`导入指令

## 部署

1. `git -clone`

2. `cd ./src`, `npm install`, `npm run build` (使用 [Vite](https://github.com/vitejs/vite))

3. 配置 `Nginx`, 反向代理 `/opencommand` `/status` , 通过 `Header/reqip` 指定目标转发服务器
   
4. `cd ./api` `npm start`

5. 配置 `Nginx`, 代理 `/api` , 将请求转发至 `http://127.0.0.1:1919`

## 构建/更新 数据

参见 `/builder/`, 需要 `NodeJS` 环境

## 后话

欢迎提交任何请求
