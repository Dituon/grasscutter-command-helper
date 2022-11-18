import fs from 'fs'
import { DATA_VERSION, langList, writeLog } from "./config.js"

langList.forEach(lang => {
    fs.readdir(`./data/${lang.navigator}/`, undefined, (err, files) => {
        files.forEach(file => {
            fs.copyFile(
                `./data/${lang.navigator}/${file}`,
                `../data/${lang.navigator}/${DATA_VERSION}/${file}`,
                writeLog
                )
        })
    })
})