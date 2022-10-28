import { langData } from "./lang-loader.js"
import { unzipModalData } from "./modal-loader.js"
import { showMessage } from "./ui.js"

/** @typedef { import("./command-builder.js").CommandVO } CommandVO */

/** @const @public */
const DATA_VERSION = '3.2'

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
        //     return cache.value
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

const cacheModel = new CacheModel()

export { DATA_VERSION, cacheModel }

class ProxyItem {
    /** 
     * @param { string } name
     * @param { object } [defaultValue={}] 
     */
    constructor(name, defaultValue) {
        const localItem = cacheModel.getItem(name, defaultValue)
        let time
        const proxy = new Proxy(localItem, {
            set(target, key, value) {
                if (!time) clearTimeout(time)
                time = setTimeout(() => cacheModel.save(name, localItem), 100)
                target[key] = value
                return true
            }
        })
        return proxy
    }
}

const config = new ProxyItem('config')
/** @type { CommandVO[] } */
const localCommandGroupList = new ProxyItem('commandGroupList', [])

export { config, localCommandGroupList }

const dataCache = {}
/**
 * 
 * @param { string } url 
 * @param { {showMessage: boolean=true, unzip: boolean=false} } [param] 
 * @returns 
 */
const getUrlData = async (url, param = { showMessage: true, unzip: false }) => {
    if (dataCache[url]) return new Promise((resolve, reject) => {
        resolve(dataCache[url])
    })
    param?.showMessage && showMessage(langData.loading, 10000)
    const promise = cacheModel.getUrl(url).then(data => {
        if (param?.unzip) data = unzipModalData(data)
        dataCache[url] = data
        param?.showMessage && showMessage(langData.loadSuccess)
        return data
    })

    param?.showMessage && promise.catch((e) => showMessage(langData.loadFail, 10000))
    return promise
}

export { dataCache, getUrlData }