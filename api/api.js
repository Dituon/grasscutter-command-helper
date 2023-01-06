import http from 'http'
import fs from 'fs'

import config from './config.js'

if (!fs.existsSync('../share/')) fs.mkdirSync('../share/')

export const server = http.createServer()

server.on('request', async (req, res) => {
    let rawStr = '', hash = req.headers.hash
    if (!hash) {
        res.writeHead(400)
        res.end()
        return
    }
    req.on('data', str => rawStr += str)
    await new Promise(rej => req.on('end', rej))

    if (!rawStr.startsWith('gmh://') || !rawStr.endsWith('!')
        || (getHash(rawStr) != hash)) {
        res.writeHead(400)
        res.end()
        return
    }

    res.writeHead(200, { 'Content-Type': 'application/json' })
    fs.writeFile(`../share/${hash}.gmh`, rawStr, 'utf-8', err => {
        res.write(`{"retcode": ${err ? 400 : 200}}`)
        res.end()
    })
})

function getHash(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i)
        hash = hash & hash
    }
    return Math.abs(hash)
}

server.listen(config.port, () => console.log(server))