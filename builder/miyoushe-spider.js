import fetch from 'node-fetch'
import { load } from 'cheerio'

const getArtifactItems = async id => {
    return fetch(`https://api-static.mihoyo.com/common/blackboard/ys_obc/v1/content/info?app_sn=ys_obc&content_id=${id}`)
        .then(p => p.json()).then(data => {
            const content = data.data.content.contents[0].text
            const $ = load(content)

            const output = []

            $('[data-data]').each(function (i, ele) {
                const raw = $(this).attr('data-data')
                const itemData = JSON.parse(decodeURIComponent(raw))
                itemData.forEach(item => {
                    if (item.tmplKey !== 'relic') return
                    item.data.content.forEach(i => output.push(i))
                })
            })

            return output
        })
}

const getFullItemList = async () => {
    return fetch('https://api-static.mihoyo.com/common/blackboard/ys_obc/v1/home/content/list?app_sn=ys_obc&channel_id=189')
        .then(p => p.json()).then(data => {
            /** @type {[]} */
            const itemCategory = data.data.list[0].children

            itemCategory.forEach(category => {
                const cls = { id: category.id, name: category.name, list: [] }
                if (cls.id !== 218) return //圣遗物

                category.list.forEach(item => {
                    const itm = {
                        id: item.content_id,
                        name: item.title,
                        icon: item.icon,
                        tags: []
                    }

                    const filterRaw = item.ext
                    const filter = JSON.parse(filterRaw)
                    const filterText = Object.values(filter)[0]?.filter?.text
                    if (!filterText) return
                    const tags = JSON.parse(filterText)
                    itm.tags = tags

                    if (cls.id === 218) getArtifactItems(itm.id).then(data => {
                        itm.children = data
                    })

                    cls.list.push(itm)
                })
            })
        })
}

getFullItemList()
