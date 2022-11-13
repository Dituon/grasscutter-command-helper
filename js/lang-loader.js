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
    loading: 'Loading...',
    loadSuccess: 'Load Successfully',
    loadFail: 'Load Failure',

    placeholder: 'place hold ',
    placechooser: 'place choose ',
    noParam: 'This command has no parameters',

    copySuccess: 'Copy Success',
    copyFail: 'Copy Failure, Please try again',
    chooseCommandFirst: 'Select the Command first',
    showFilter: 'Filters',
    commandPushed: 'Pushed to Worktop',

    serverNotDefined: 'Server not specified',
    gettingServerInfo: 'Acquiring server information...',
    getServerInfoSuccess: 'Server information acquire successfully',
    getServerInfoFail: 'Cannot connect to server',
    serverNotSupport: 'Server does not support Remote Execute',
    cannotConnectServer: 'Cannot connect to server',

    unboundPlayer: 'Player has not been bound',
    playerNotFound: 'Player not found',
    requestsTooFrequent: 'Requests too frequent',

    verifycodeSended: 'Verifycode has been sent',
    verifycodeError: 'Verifycode Error',
    verifySuccess: 'Verification success',
    verifyFail: 'Verification failure',
    playerBound: 'Binded UID: $UID',

    commandEmpty: 'Command cannot be Empty',
    commandExecuted: 'Command has been executed',
    commandExecuteFail: 'Command execution failed',

    commandImportSuccess: 'Command import successful',
    commandImportFail: 'Command import failure',
    commandExportSuccess: 'Command exported successfully, check your clipboard',

    commandNotChoose: 'No command selected',
    commandUnmaned: 'Command Unnamed',

    unknowError: 'No known errors, please submit issue'
}

export const initLang = () => {
    console.log(config.lang)
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
        langData = lang
        document.querySelectorAll('[bind]').forEach(node => {
            const target = node.getAttribute('bind-target')
            const value = lang[node.getAttribute('bind')]
            if (!value) return
            if (target) {
                node.setAttribute(target, value)
                return
            }
            node.innerHTML = value
        })
    })

    const langSelectElement = document.getElementById('lang-select')
    supportedLang.forEach(lang => {
        const option = document.createElement('option')
        option.innerHTML = lang.text
        option.value = lang.id
        langSelectElement.appendChild(option)
    })
    langSelectElement.value = config.lang
    langSelectElement.onchange = e => {
        config.lang = langSelectElement.value
        setTimeout(()=>location.reload(), 1000)
    }
}
