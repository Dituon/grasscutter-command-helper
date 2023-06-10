import fs from 'fs'

/** @typedef { {id: number, name: string, filter: []} } itemDTO */
/** @return { {items: itemDTO[], scenes:itemDTO[], quests: itemDTO[]} }  */
function parseHandbook(lang) {
    const handbookRaw = fs.readFileSync(`./handbooks/GM Handbook - ${lang}.txt`).toString()

    let typeList = [
        getRawGroup('Avatars') + getRawGroup('Items') + getRawGroup('Monsters'),
        getRawGroup('Scenes'),
        getRawGroup('Quests'),
        getRawGroup('Achievements')
    ]

    typeList = typeList.map(rawText => {
        let rawList = rawText.split('\n')
        rawList = rawList.filter(line => {
            return !line.startsWith('//') && line && line.includes(':')
        })

        const itemList = []
        rawList.forEach(line => {
            const item = line.split(':')
            let itemId = parseInt(item[0].trim())
            if (!itemId) return
            itemList.push({
                id: itemId,
                name: item[1].trim()
            })
        })

        return itemList
    })

    return {
        items: typeList[0],
        scenes: typeList[1],
        quests: typeList[2],
        achievements: typeList[3]
    }

    /**
     * @param {string} startStr 
     * @param {string} endStr 
     */
    function getRawGroup(name) {
        const startStrIndex = handbookRaw.indexOf(`// ${name}`)
        const endStrIndex = handbookRaw.indexOf('//', startStrIndex + 2)
        return handbookRaw.substring(
            startStrIndex, 
            endStrIndex == -1 ? handbookRaw.length : endStrIndex
            )
    }
}

export { parseHandbook }