/** @typedef { import("./command-parser").CommandGroupDTO } CommandGroupDTO */

/** @const @public */
export const DATA_VERSION = '3.5'

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
        if (cache && cache.version === DATA_VERSION)
            return cache.value
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
export const servers = new ProxyItem('servers', {})
/** @type {string[]} */
export const importedList = new ProxyItem('imported', [])
/** @type {number[]} */
export const updatedList = new ProxyItem('updated', [])

export const dataCache = {}
