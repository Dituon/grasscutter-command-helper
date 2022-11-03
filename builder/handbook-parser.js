import fs from 'fs'

/** @return { {id: number, name: string, filter: []}[] }  */
function parseHandbook(lang) {
    const handbookRaw = fs.readFileSync(`./handbooks/GM Handbook - ${lang}.txt`).toString()

    let rawList = handbookRaw.split('\n')
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
            name: item[1].trim(),
            filter: []
        })
    })

    return itemList
}

export { parseHandbook }