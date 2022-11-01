import fetch from 'node-fetch'
import fs from 'fs'

// [
//     "ja-jp",
//     "en-us",
//     "id-id",
//     "ko-kr",
//     "zh-tw",
//     "vi-vn",
//     "es-es",
//     "de-de",
//     "fr-fr",
//     "pt-pt",
//     "th-th",
//     "zh-cn",
//     "ru-ru"
// ].forEach(lang => {
//     spider(lang)
// })

spider('zh-cn')

function spider(lang) {
    const dir = `./data/${lang}`

    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

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
        const promiseList = []

        menu.data.menus.forEach(category => {
            category.sub_menus.forEach(sub => {
                const menu = {
                    id: sub.id,
                    name: sub.name
                }

                menuList.push(menu)
                promiseList.push(
                    getMenuFilter(sub.id).then(filterList => {
                        menu.filterGroups = filterList
                    }),
                    getItems(sub.id).then(itemList => {
                        if (sub.id == 5) {
                            Promise.all(itemList).then(dataList => {
                                fs.writeFile(
                                    `./data/${lang}/${sub.name}.json`,
                                    JSON.stringify(dataList),
                                    err
                                )
                            })
                        } else {
                            fs.writeFile(
                                `./data/${lang}/${sub.name}.json`,
                                JSON.stringify(itemList),
                                err
                            )
                        }
                    })
                )
            })
        })

        Promise.all(promiseList).then(() => {
            fs.writeFile(
                `./data/${lang}/menu.json`,
                JSON.stringify(menuList),
                err
            )
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
                use_es: true
            })
        ).then(p => p.json()).then(itemList => {
            const requestList = []

            itemList.data.list.forEach(item => {
                const filterValues = Object.values(item.filter_values)

                const itemObj = {
                    name: item.name,
                    icon: item.icon_url,
                    filter: filterValues?.length ? filterValues[0].values : []
                }

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
                children.push({
                    type: item.posName,
                    name: item.title,
                    icon: item.icon_url
                })
            })

            target.children = children
            return target
        })
    }
}

function err(err) {
    if (err) return console.log(err + 'Write Fail')
    console.log('Write Success')
}