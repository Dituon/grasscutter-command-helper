/**
 * this script need
 * `./handbooks/GM Handbook Global Prop.txt`, build by gc Tools.java
 * `./Resources/ExcelBinOutPut/ManualTextMapConfigData.json`,
 * `./Resources/TextMap/*`
 * in build dir
 */

import fs from 'fs'
import { langList, writeLog } from './config.js'

const propRaw = fs.readFileSync('./handbooks/GM Handbook Global Prop.txt').toString()

const textMapIndex = JSON.parse(
    fs.readFileSync('./Resources/ExcelBinOutPut/ManualTextMapConfigData.json').toString()
)


const mainPropList = getRawGroup('MainProp').split('\n')
    .filter(line => !!line).map(propLine => {
        const prop = propLine.split(' : ')
        return {
            rawID: prop[0],
            textID: prop[1],
            textHash: undefined,
            name: undefined,
            extiaText: ''
        }
    })

const propDataList = getRawGroup('PropData').split('\n')
    .filter(line => !!line).map(propLine => {
        const prop = propLine.split(' : ')
        let type = prop[1].split(' ')[0]
        if (!mainPropList.includes(type)) mainPropList.push({
            textID: type,
            extiaText: ''
        })
        return { id: prop[0], type: type, name: prop[1] }
    })


mainPropList.forEach(prop => {
    for (const indexObj of textMapIndex) {
        if (indexObj.textMapId !== prop.textID) continue
        prop.textHash = indexObj.textMapContentTextMapHash
        if (indexObj.textMapId.endsWith('PERCENT')) prop.extiaText = ' (%)'
        return
    }
})

langList.forEach(lang => {
    (async function(){
        const dir = `./data/${lang.navigator}`
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        const langMainPropList = JSON.parse(JSON.stringify(mainPropList))
        const langPropDataList = JSON.parse(JSON.stringify(propDataList))
    
        fs.readFile(`./Resources/TextMap/TextMap${lang.handbook}.json`, 'utf-8', (err, raw) => {
            const mapObj = JSON.parse(raw.toString())
            const propMap = new Map()
            langMainPropList.forEach(prop => {
                const name = mapObj[`${prop.textHash}`] + prop.extiaText
                prop.name = name
    
                if (!propMap.has(name)) {
                    propMap.set(name, { name: name, ids: [] })
                }
    
                if(prop.rawID) propMap.get(name).ids.push(prop.rawID)
            })
    
            fs.writeFile(
                `${dir}/mainPropList.json`,
                JSON.stringify([...propMap.values()].filter(prop => prop.ids.length)),
                writeLog
            )
    
            propMap.forEach(prop => {
                prop.ids = undefined
                prop.children = []
            })
    
            langPropDataList.forEach(propData => {
    
                langMainPropList.some(mainProp => {
                    if (mainProp.textID === propData.type) {
                        propData.name = propData.name.replace(propData.type, mainProp.name)
                        propMap.get(mainProp.name).children.push({
                            id: propData.id, name: propData.name
                        })
                        return true
                    }
                    return false
                })
    
            })
    
            propMap.forEach((prop, type) => {
                if (!prop.children?.length) propMap.delete(type)
            })
    
            fs.writeFile(
                `${dir}/propDataList.json`,
                JSON.stringify([...propMap.values()]),
                writeLog
            )
        })
    })()
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