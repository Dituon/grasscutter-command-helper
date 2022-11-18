export const DATA_VERSION = '3.2'

export const langList = [
    { hoyolab: 'en-us', handbook: 'EN', navigator: 'en-US', primary: true },
    { hoyolab: 'ja-jp', handbook: 'JP', navigator: 'ja' },
    { hoyolab: 'id-id', handbook: 'ID', navigator: 'id' },
    { hoyolab: 'ko-kr', handbook: 'KR', navigator: 'ko' },
    { hoyolab: 'zh-tw', handbook: 'CHT', navigator: 'zh-TW' },
    { hoyolab: 'vi-vn', handbook: 'VI', navigator: 'vi' },
    { hoyolab: 'es-es', handbook: 'ES', navigator: 'es' },
    { hoyolab: 'de-de', handbook: 'DE', navigator: 'de' },
    { hoyolab: 'fr-fr', handbook: 'FR', navigator: 'fr' },
    { hoyolab: 'pt-pt', handbook: 'PT', navigator: 'pt' },
    { hoyolab: 'th-th', handbook: 'TH', navigator: 'th' },
    { hoyolab: 'zh-cn', handbook: 'CHS', navigator: 'zh-CN' },
    { hoyolab: 'ru-ru', handbook: 'RU', navigator: 'ru' },
]

export const menuIndex = {
    '5': 'artifactList',
    '2': 'avatarList',
    '15': 'entityList',
    '9': 'itemList',
    '7': 'monsterList',
    '4': 'weaponList'
}


export function writeLog(err) {
    if (err) return console.log(err + ' Write Fail')
    console.log('Write Success')
}