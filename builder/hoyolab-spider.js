import fetch from 'node-fetch'
import fs from 'fs'
import { langList } from './config.js'
import { parseHandbook } from './handbook-parser.js'

// langList.forEach(lang => {
//     spider(lang.hoyolab)
// })

spider(
    { hoyolab: 'zh-cn', handbook: 'CHS', navigator: 'zh-CN' }
)

const idMap = new Map()

function spider(langObj) {
    const lang = langObj.hoyolab
    const dir = `./data/${lang}`

    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    const handbook = parseHandbook(langObj.handbook)

    const fetchParam = body => {
        const bodyStr = JSON.stringify(body)
        return {
            method: body ? 'POST' : 'GET',
            body: body ? bodyStr : undefined,
            headers: {
                'x-rpc-language': lang,
                'Referer': 'https://wiki.hoyolab.com/',
                'Content-Type': 'application/json'
            }
        }
    }

    fetch(
        'https://sg-wiki-api-static.hoyolab.com/hoyowiki/wapi/get_menus',
        fetchParam()
    ).then(p => p.json()).then(menu => {
        const menuList = []
        const menuPromiseList = []
        const itemsPromiseList = []

        menu.data.menus.forEach(category => {
            category.sub_menus.forEach(sub => {
                const menu = {
                    id: sub.id,
                    name: sub.name
                }

                menuList.push(menu)
                menuPromiseList.push(
                    getMenuFilter(sub.id).then(filterList => {
                        menu.filterGroups = filterList
                    }),
                    getItems(sub.id).then(itemList => {
                        itemsPromiseList.push(itemList)
                    })
                )
            })
        })

        Promise.all(menuPromiseList).then(() => {
            fs.writeFile(
                `./data/${lang}/menu.json`,
                JSON.stringify(menuList),
                err
            )
        }).then(() => {
            Promise.all(itemsPromiseList).then(dataLists => {
                const itemList = []
                console.log(dataLists)
                dataLists.forEach(list => {
                    itemList.push(...list)
                })
                console.log(itemList)

                const op = {
                    avatar: { name: 'avatarList' },
                    stellaFortuna: { name: 'avatarStellaFortunaList' },
                    weapon: { name: 'weaponList' },
                    artifact: { name: 'artifactList' },
                    sereniteaPot: { name: 'itemSereniteaPotList' },
                    item: { name: 'itemList' },
                }

                Object.values(op).forEach(obj => {
                    obj.list = []
                })

                handbook.forEach(item => {
                    let id = item.id
                    if (id >= 10000000 && id < 11000000) { //Avatar 角色
                        injectInfo(item)
                        op.avatar.list.push(item)
                    } else if (id >= 11000000 && id < 12000000) { //Test Avatar 测试角色
                        item.filter.push('Invalid')
                        op.avatar.list.push(item)
                    } else if (id >= 1100 && id < 1200) { //Stella Fortuna 命星
                        injectInfo(item)
                        op.stellaFortuna.list.push(item)
                    } else if (id >= 10002 && id <= 20001) { //Weapon 武器
                        injectInfo(item)
                        op.weapon.list.push(item)
                    } else if (id >= 20002 && id < 100000) { //Artifact 圣遗物
                        op.artifact.list.push(item)
                    } else if (id >= 340000 && id < 350000) { //Skin 皮肤
                        item.filter.push('Skin')
                        op.item.list.push(item)
                    } else if ( // Serenitea Pot 尘歌壶
                        (id >= 350000 && id < 400000)
                        || (id >= 141000 && id < 142000)
                        || id == 3750102
                    ) {
                        op.sereniteaPot.list.push(item)
                    }
                })

                function injectInfo(obj) {
                    // console.log('inject ', obj)
                    itemList.some(item => {
                        if (!item?.name) return false
                        if (item.name.includes(obj.name)) {
                            obj.name = item.name
                            obj.icon = item.icon
                            obj.filter = item.filter
                            return true
                        }
                        return false
                    })
                }

                Object.values(op).forEach(obj => {
                    fs.writeFile(
                        `./data/${lang}/${obj.name}.json`,
                        JSON.stringify(obj),
                        err
                    )
                })
            })
        })
    })

    /** @return { Promise<{ name: string, filters: string[] }[]> } */
    async function getMenuFilter(id) {
        return fetch(
            `https://sg-wiki-api-static.hoyolab.com/hoyowiki/wapi/get_menu_filters?menu_id=${id}`,
            fetchParam()
        ).then(p => p.json()).then(menuFilter => {
            if (!menuFilter.data) return []
            const filterGroupList = []

            menuFilter.data.filters.forEach(filter => {
                const filterObj = { name: filter.text, filters: [] }
                filter.values.forEach(f => {
                    filterObj.filters.push(f.value)
                })
                filterGroupList.push(filterObj)
            })

            return filterGroupList
        })
    }

    async function getItems(id) {
        return fetch(
            'https://sg-wiki-api.hoyolab.com/hoyowiki/wapi/get_entry_page_list',
            fetchParam({
                filters: [],
                menu_id: `${id}`,
                page_num: 1,
                page_size: 10000,
                // page_size: 100,
                use_es: true
            })
        ).then(p => p.json()).then(itemList => {
            const requestList = []

            itemList.data.list.forEach(item => {

                const itemObj = {
                    name: item.name,
                    icon: item.icon_url,
                    filter: []
                }

                Object.values(item.filter_values).forEach(filterElement => {
                    itemObj.filter.push(...filterElement.values)
                })

                requestList.push(id == 5 ?
                    getArtifactChindren(item.entry_page_id, itemObj)
                    : itemObj
                )
            })

            return requestList
        })
    }

    async function getArtifactChindren(id, target) {
        return fetch(
            `https://sg-wiki-api-static.hoyolab.com/hoyowiki/wapi/entry_page?entry_page_id=${id}`,
            fetchParam()
        ).then(p => p.json()).then(entryInfo => {
            let dataRaw = entryInfo.data.page.modules[1].components[0].data
            const children = []

            Object.values(JSON.parse(dataRaw)).forEach(item => {

                const itemObj = {
                    type: item.posName,
                    name: item.title,
                    icon: item.icon_url
                }

                children.push(itemObj)
            })

            target.children = children
            return target
        })
    }
}

function err(err) {
    if (err) return console.log(err + ' Write Fail')
    console.log('Write Success')
}