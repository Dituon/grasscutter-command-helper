import { cacheModel, config } from './init.js'

export const supportedLang = [
    { id: 'zh-CN', text: '简体中文', alias: ['zh'] },
    { id: 'zh-TW', text: '繁體中文', alias: ['zh-HK', 'zh-SG'] },
    {
        id: 'en-US', text: 'English', alias: [
            'en',
            'en-EG', 'en-AU', 'en-GB', 'en-CA', 'en-NZ',
            'en-IE', 'en-ZA', 'en-JM', 'en-BZ', 'en-TT'
        ]
    }
]

export let langData = {
    loading: '加载中...',
    loadSuccess: '加载成功',
    loadFail: '加载失败',
    placeholder: '请输入 ',
    placechooser: '请选择 ',
    noParam: '此命令无参数',
    copySuccess: '复制成功',
    copyFail: '复制失败, 请重试',
    chooseCommandFirst: '请先选择指令',
    showFilter: '展开 / 收起  过滤器',

    commandPushed: '已添加至指令组',
    serverNotDefined: '未指定服务器',
    gettingServerInfo: '正在获取服务器信息...',
    getServerInfoSuccess: '获取成功',
    getServerInfoFail: '无法连接到远程服务器',

    serverNotSupport: '服务器不支持远程执行',
    cannotConnectServer: '无法连接到服务器',
    unboundPlayer: '未绑定玩家',
    playerNotFound: '未找到玩家',
    requestsTooFrequent: '请求过于频繁',
    verifycodeSended: '验证码已发送',
    verifycodeError: '验证码错误',
    verifySuccess: '账户验证成功',
    verifyFail: '账户验证失败',
    playerBound: '已绑定UID: $UID', 

    commandEmpty: '指令不能为空',
    commandExecuted: '指令已执行',
    commandExecuteFail: '指令执行失败',

    commandImportSuccess: '指令导入成功',
    commandImportFail: '指令导入失败',
    commandExportSuccess: '指令导出成功, 已输出至剪切板',

    commandNotChoose: '未选择任何指令',
    commandUnmaned: '未命名',

    unknowError: '未知错误, 请提交issue反馈'
}

export const initLang = () => {
    if (!config.lang) {
        const windowLang = navigator.language
        for (const lang of supportedLang) {
            if (windowLang === lang.id) {
                config.lang = lang.id
                break
            }
            lang.alias.forEach(alia => {
                if (alia === windowLang) config.lang = lang.id
            })
        }
        if (!config.lang) config.lang = 'en-US'
    }

    cacheModel.getUrl(`./lang/${config.lang}.json`).then(lang => {
        // langData = lang
        document.querySelectorAll('[bind]').forEach(node => {
            const target = node.getAttribute('bind-target')
            const value = lang[node.getAttribute('bind')]
            if (target) {
                node.setAttribute(target, value)
                return
            }
            node.innerHTML = value
        })
    })
}
