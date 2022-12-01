import { langData, initLang } from "./lang-loader.js"
import { unzipModalData } from "./modal-loader.js"
import { showMessage } from "./ui.js"

/** @typedef { import("./command-parser").CommandGroupDTO } CommandGroupDTO */

/** @const @public */
export const DATA_VERSION = '3.2'

class CacheModel {
    /**
     * @param { string } localId 
     * @param { object } [defaultValue={}] 
     */
    getItem(localId, defaultValue = {}) {
        let local = localStorage.getItem(localId)
        if (local) return JSON.parse(local)
        this.save(localId, defaultValue)
        return defaultValue
    }

    /**
     * @param { string } url 
     * @returns { Promise<any> }
     */
    async getUrl(url) {
        let cachedData = localStorage.getItem(url)
        let cache = cachedData ? JSON.parse(cachedData) : {}
        // if (cache && cache.version === DATA_VERSION)
        // return cache.value
        return fetch(url).then(p => p.json()).then(data => {
            this.save(url, {
                version: DATA_VERSION,
                value: data
            })
            return data
        })
    }

    save(key, value) {
        localStorage.setItem(key, JSON.stringify(value))
    }

    clear(key) { localStorage.setItem(key, '') }
}

export const cacheModel = new CacheModel()

export class ProxyItem {
    /** 
     * @param { string } name
     * @param { object } [defaultValue={}] 
     */
    constructor(name, defaultValue = {}) {
        const localItem = cacheModel.getItem(name, defaultValue)
        const proxy = new Proxy(localItem, {
            set(target, key, value) {
                target[key] = value
                cacheModel.save(name, localItem)
                return true
            }
        })
        return proxy
    }
}

export const config = new ProxyItem('config')
/** @type { CommandGroupDTO[] } */
export const localCommandGroupList = new ProxyItem('commandGroupList', [])
console.log(localCommandGroupList)
export const servers = new ProxyItem('servers', {})
/** @type {string[]} */
export const importedList = new ProxyItem('imported', [])

export const dataCache = {}
/**
 * 
 * @param { string } url 
 * @param { {showMessage: boolean=true, unzip: boolean=false} } [param] 
 * @returns 
 */
export const getUrlData = async (url, param = { showMessage: true, unzip: false }) => {
    if (dataCache[url]) return dataCache[url]
    param?.showMessage && showMessage(langData.loading, 10000)
    const promise = cacheModel.getUrl(url).then(data => {
        if (param?.unzip) data = unzipModalData(data)
        dataCache[url] = data
        param?.showMessage && showMessage(langData.loadSuccess)
        return data
    })

    param?.showMessage && promise.catch(() => showMessage(langData.loadFail, 10000))
    return promise
}

initLang()

/** @param { string } strs */
String.prototype.includesMultiple = function (...strs) {
    let flag = true
    for (const str of strs) {
        if (!this.includes(str)) {
            flag = false
            break
        }
    }
    return flag
}

/** @param { T } objs */
Array.prototype.includesMultiple = function (...objs) {
    let flag = true
    for (const obj of objs) {
        if (!this.includes(obj)) {
            flag = false
            break
        }
    }
    return flag
}

String.prototype.copy = function () {
    navigator.clipboard.writeText(this).then(
        () => showMessage(langData.copySuccess),
        () => showMessage(langData.copyFail)
    )
}