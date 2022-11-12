/**
 * this script need
 * `./handbooks/GM Handbook - ${lang}.txt`
 * in build dir
 */

import fetch from 'node-fetch'
import fs from 'fs'
import { langList, menuIndex, writeLog } from './config.js'
import { parseHandbook } from './handbook-parser.js'

langList.forEach(lang => {
    spider(lang)
})

// spider(
//     { hoyolab: 'zh-cn', handbook: 'CHS', navigator: 'zh-CN' }
// )

function spider(langObj) {
    const lang = langObj.hoyolab
    const outputLang = langObj.navigator
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
                    type: menuIndex[`${sub.id}`] ?? sub.id,
                    name: sub.name
                }

                menuList.push(menu)
                menuPromiseList.push(
                    getMenuFilter(sub.id).then(filterList => {
                        menu.filterGroups = filterList
                    }),
                    getItems(sub.id).then(itemList => {
                        itemsPromiseList.push(...itemList)
                    })
                )
            })
        })

        Promise.all(menuPromiseList).then(() => {
            fs.writeFile(
                `./data/${outputLang}/menu.json`,
                JSON.stringify(menuList),
                writeLog
            )
        }).then(() => {
            Promise.all(itemsPromiseList).then(itemList => {

                const artifactList = []
                itemList.forEach(item => {
                    if (item.children) artifactList.push(item)
                })

                const op = {
                    avatar: { name: 'avatarList' },
                    stellaFortuna: { name: 'avatarStellaFortunaList' },
                    weapon: { name: 'weaponList' },
                    artifact: { name: 'artifactList' },
                    sereniteaPot: { name: 'itemSereniteaPotList' },
                    item: { name: 'itemList' },
                    monster: { name: 'monsterList' },
                    entity: { name: 'entityList' },
                    quest: { name: 'questList' },
                    scene: { name: 'sceneList' }
                }

                Object.values(op).forEach(obj => {
                    obj.list = []
                })

                /** @type { Map<string, number[]> } */
                const artifactIdsMap = new Map()

                handbook.items.forEach(item => {
                    if (item.name.includes('[N/A]')) return
                    let id = item.id
                    if (id >= 10000000 && id < 11000000) { //Avatar 角色
                        injectInfo(item)
                        op.avatar.list.push(item)
                    } else if (id >= 11000000 && id < 12000000) { //Test Avatar 测试角色
                        if (!item.filter) item.filter = []
                        item.filter.push('Invalid')
                        op.avatar.list.push(item)
                    } else if (id >= 1100 && id < 1200) { //Stella Fortuna 命星
                        injectInfo(item)
                        op.stellaFortuna.list.push(item)
                    } else if (id >= 10002 && id <= 20001) { //Weapon 武器
                        injectInfo(item)
                        op.weapon.list.push(item)
                    } else if (id >= 20002 && id < 100000) { //Artifact 圣遗物
                        let idStr = item.id.toString()
                        let outputId = parseInt(idStr.substring(0, idStr.length - 1) + '0')

                        for (const artifactGroup of artifactList) {
                            for (const artifactItem of artifactGroup.children) {
                                if (artifactItem.name == item.name) {
                                    if (!artifactItem.ids) artifactItem.ids = []
                                    if (!artifactItem.ids.includes(outputId)) artifactItem.ids.push(outputId)
                                    return
                                }
                            }
                        }
                        if (!artifactIdsMap.has(item.name)) artifactIdsMap.set(item.name, [])
                        const ids = artifactIdsMap.get(item.name)
                        // if (!ids.includes(outputId)) 
                        ids.push(item.id)
                    } else if (id >= 340000 && id < 350000) { //Skin 皮肤
                        if (!item.filter) item.filter = []
                        item.filter.push('Skin')
                        op.item.list.push(item)
                    } else if ( // Serenitea Pot 尘歌壶
                        (id >= 350000 && id < 400000)
                        || (id >= 141000 && id < 142000)
                        || id == 3750102
                    ) {
                        op.sereniteaPot.list.push(item)
                    } else if (id >= 20010100 && id < 35320000) { // Entity&Monster 实体 怪物
                        if (item.name.toLowerCase().includes('test')) {
                            if (!item.filter) item.filter = []
                            item.filter.push('Test')
                        }
                        item.name = item.name.split(' - ').at(-1).trim()
                        injectInfo(item)

                        id >= 28010100 && id <= 28240902 ?
                            op.entity.list.push(item) : op.monster.list.push(item)
                    } else {
                        injectInfo(item)
                        op.item.list.push(item)
                    }
                })

                artifactList.forEach(artifact => {
                    op.artifact.list.push(artifact)
                })
                artifactIdsMap.forEach((ids, name) => {
                    op.artifact.list.push(
                        ids.length === 1 ?
                            { id: ids[0], name: name }
                            : {
                                ids: [
                                    ...new Set(ids.map(id => {
                                        let idStr = id.toString()
                                        return parseInt(idStr.substring(0, idStr.length - 1) + '0')
                                    }))
                                ], name: name
                            }
                    )
                })

                handbook.quests.forEach(quest => {
                    if (quest.name.includes('[N/A]')) return
                    quest.filter = []
                    if (quest.name.includes('$HIDDEN')) {
                        quest.name = quest.name.replace('$HIDDEN', '')
                        quest.filter.push('Hidden')
                    }
                    if (quest.name.includes('$UNRELEASED')) {
                        quest.name = quest.name.replace('$UNRELEASED', '')
                        quest.filter.push('Unreleased')
                    }
                    if (quest.name.toLocaleLowerCase().includes('test')) {
                        quest.name = quest.name.replace('（', '(').replace('）', ')')
                            .replace('(test)', '').replace('(TEST)', '').replace('(Test)', '')
                        quest.filter.push('Test')
                    }
                    if (!quest.filter) quest.filter = undefined
                    op.quest.list.push(quest)
                })

                handbook.scenes.forEach(scene => {
                    op.scene.list.push(scene)
                })

                function injectInfo(obj) {
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
                        `./data/${outputLang}/${obj.name}.json`,
                        JSON.stringify(obj.list),
                        writeLog
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
                    getArtifactChildren(item.entry_page_id, itemObj)
                    : itemObj
                )
            })

            return requestList
        })
    }

    async function getArtifactChildren(id, target) {
        return fetch(
            `https://sg-wiki-api-static.hoyolab.com/hoyowiki/wapi/entry_page?entry_page_id=${id}`,
            fetchParam()
        ).then(p => p.json()).then(entryInfo => {
            let dataRaw = entryInfo.data.page.modules[1].components[0].data
            const children = []

            Object.values(JSON.parse(dataRaw)).forEach(item => {
                if (!item.title) return

                children.push({
                    type: item.position,
                    name: item.title,
                    icon: item.icon_url
                })
            })

            target.children = children
            return target
        })
    }
}
