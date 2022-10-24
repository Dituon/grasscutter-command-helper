/** @const @public */
const DATA_VERSION = '3.2'

class CacheModel {
    getItem(key, defaultValue = {}) {
        let local = localStorage.getItem(key)
        if (local)
            return JSON.parse(local)
        this.save(key, defaultValue)
        return defaultValue
    }

    async getUrl(url) {
        let cachedData = localStorage.getItem(url)
        let cache = cachedData ? JSON.parse(cachedData) : {}
        // if (cache && cache.version === DATA_VERSION)
        //     return cache.value
        return fetch(url).then(p => p.json()).then(data => {
            cache = {}
            cache.version = DATA_VERSION
            cache.value = data
            this.save(url, cache)
            return data
        })
    }

    save(key, value) { localStorage.setItem(key, JSON.stringify(value)) }

    clear(key) { localStorage.setItem(key, '') }
}

const cacheModel = new CacheModel()

const _localConfig = cacheModel.getItem('config')
let time
const config = new Proxy(_localConfig, {
    set: (target, key, value) => {
        console.log(target, key, value)
        if (!time) {
            clearTimeout(time);
        }
        time = setTimeout(() => {
            cacheModel.save('config', _localConfig)
        }, 500)

        target[key] = value
        return true
    }
})

const dataCache = {}

export { DATA_VERSION ,cacheModel, config, dataCache }