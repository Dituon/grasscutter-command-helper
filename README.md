# Grasscutter Command Helper

English | [简体中文](https://github.com/Dituon/grasscutter-command-helper/blob/main/README-CHS.md)

## [Demo](https://cmd.d2n.moe/new)

## Intro

A command generator for Grasscutter with other awesome extras

Any requests are welcome

## Current features

- Generate command

- Multi command version support

- Save & Share & Import

- Remote command (Need [OpenCommand Plugin](https://github.com/jie65535/gc-opencommand-plugin))

- Multilingual support

## GET parameters

The script read the `GET` params in URL, you can provide some default param to the user

| params    | value field                       | description        |
| --------- | --------------------------------- | ------------------ |
| `version` | `1.6.1` `1.4.2` `GM` `1.2.1`      | command version    |
| `lang`    | `navigator.language`              | language           |
| `server`  | `encodeURIComponent(URL)`         | remote server host |
| `import`  | `encodeURIComponent(URL)`         | import command     |

**Examples**

> `https://cmd.d2n.moe/new?version=1.4.2&server=https%3A%2F%2Fgenshinserver.xmmt.fun%3A25568`
> 
> command version is `1.4.2`, remote server is `https://genshinserver.xmmt.fun:25568`

> `https://cmd.d2n.moe/new?lang=en-US&import=./share/artifact.gmh`
>
> Language is `English`, import command from `./share/artifact.gmh`

## Deploy

1. `git -clone`

2. `cd ./src`, `npm install`, `npm run build` (Use [Vite](https://github.com/vitejs/vite))

3. Configure `Nginx`, reverse proxy `/opencommand` `/status`, specify the target forwarding server through `Header/reqip`
   
4. `cd ./api` `npm start`
   
5. Configure `Nginx`, proxy `/api`, forward the requests to `http://127.0.0.1:1919`

## Build & Update Data

See `/builder/`, need nodejs

## Translate

This framework supports multiple languages, Please help us to translate the page into your language!

- UI Content: `/lang/yourlang.json`
- Template content: `/data/yourlang/CommandList-ver.json`

## Links

[Discord](https://discord.gg/uDSQfQTrd8)
