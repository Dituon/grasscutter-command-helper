import { cacheModel, config } from './init.js'

const supportedLang = [
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

let langData = {
    loading: '加载中...',
    loadSuccess: '加载成功',
    loadFail: '加载失败',
    placeholder: '请输入 ',
    placechooser: '请选择 ',
    noParam: '此命令无参数',
    copySuccess: '复制成功',
    copyFail: '复制失败, 请重试',
    chooseCommandFirst: '请先选择指令'
}

export { langData }

window.addEventListener('load', e => {
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
})