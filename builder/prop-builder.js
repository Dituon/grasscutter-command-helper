/**
 * this script need
 * `./handbooks/GM Handbook Global Prop.txt`, 
 * `./Resources/ExcelBinOutPut/ManualTextMapConfigData.json`,
 * `./Resources/TextMap/*`
 * in build dir
 */

import fs from 'fs'
import { langList, writeLog } from './config.js'

const propRaw = fs.readFileSync('./handbooks/GM Handbook Global Prop.txt').toString()

const mainPropList = getRawGroup('MainProp').split('\n')
    .filter(line => !!line).map(propLine => {
        const prop = propLine.split(' : ')
        return { rawID: prop[0], textID: prop[1] }
    })

const textMapIndex = JSON.parse(
    fs.readFileSync('./Resources/ExcelBinOutPut/ManualTextMapConfigData.json').toString()
)

mainPropList.forEach(prop => {
    textMapIndex.some(indexObj => {
        if (indexObj.textMapId === prop.textID) {
            prop.textHash = indexObj.textMapContentTextMapHash
            return true
        }
        return false
    })
})

const propDataList = getRawGroup('PropData').split('\n')
    .filter(line => !!line).map(propLine => {
        const prop = propLine.split(' : ')
        let type = prop[1].split(' ')[0]
        return { id: prop[0], type: type, name: prop[1] }
    })

langList.forEach(lang => {
    const dir = `./data/${lang.hoyolab}`
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    fs.readFile(`./Resources/TextMap/TextMap${lang.handbook}.json`, 'utf-8', (err, raw) => {
        const mapObj = JSON.parse(raw.toString())
        const propMap = new Map()
        mainPropList.forEach(prop => {
            const name = mapObj[prop.textHash + '']
            prop.name = name

            if (!propMap.has(name)) {
                propMap.set(name, { name: name, ids: [] })
            }

            propMap.get(name).ids.push(prop.rawID)
        })

        fs.writeFile(
            `./data/${lang.hoyolab}/MainProp.json`,
            JSON.stringify([...propMap.values()]),
            writeLog
        )

        propMap.forEach(prop => {
            prop.ids = undefined
            prop.chindren = []
        })

        propDataList.forEach(propData => {

            mainPropList.some(mainProp => {
                if (mainProp.textID === propData.type) {
                    propData.name = propData.name.replace(propData.type, mainProp.name)
                    propMap.get(mainProp.name).chindren.push({
                        id: propData.id, name: propData.name
                    })
                    return true
                }
                return false
            })

        })

        fs.writeFile(
            `./data/${lang.hoyolab}/PropData.json`,
            JSON.stringify([...propMap.values()]),
            writeLog
        )
    })
})


/**
 * @param {string} startStr 
 * @param {string} endStr 
 */
function getRawGroup(name) {
    const startStrIndex = propRaw.indexOf(`// ${name}`) + 3 + name.length
    const endStrIndex = propRaw.indexOf('//', startStrIndex + 2)
    return propRaw.substring(
        startStrIndex,
        endStrIndex == -1 ? propRaw.length : endStrIndex
    )
}