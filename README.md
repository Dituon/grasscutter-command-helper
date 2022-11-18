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

- Remote command

- Multilingual support

## GET parameters

The script read the `GET` params in URL, you can provide some default param to the user

| params    | value field               | description        |
| --------- | ------------------------- | ------------------ |
| `version` | `1.2.1` `1.4.2`           | command version    |
| `lang`    | `navigator.language`      | language           |
| `server`  | `encodeURIComponent(URL)` | remote server host |
| `import`  | `encodeURIComponent(URL)` | import command     |

**Examples**

> `https://cmd.d2n.moe/new?version=1.4.2&server=https%3A%2F%2Fgenshinserver.xmmt.fun%3A25568`
> 
> command version is `1.4.2`, remote server is `https://genshinserver.xmmt.fun:25568`

> `https://cmd.d2n.moe/new?lang=en-US&import=https%3A%2F%2Ffoo.com%2Fexport.txt`
>
> Language is `English`, import command from `https://foo.com/export.txt`

## Deploy

1. `git -clone`

2. Configure `Nginx`, reverse proxy `/opencommand` `/status`, specify the target forwarding server through `Header/reqip`

## Build GM Data

See `/builder/`, need nodejs

## Translate

This framework supports multiple languages, Please help us to translate the page into your language!

- UI Content: `/lang/yourlang.json`
- Template content: `/data/yourlang/CommandList-ver.json`

## Links

[Discord](https://discord.gg/Dxw5BVTN)
