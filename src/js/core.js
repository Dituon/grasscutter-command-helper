import { langData } from "./lang-loader.js"
import { unzipModalData } from "./modal-select-loader.js"
import { showMessage } from "./ui.js"
import { dataCache, cacheModel } from "./init.js"

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
        e => {
            console.warn(e)
            if (!window.copyInputElement) window.copyInputElement = document.createElement('input')
            const inputElement = window.copyInputElement
            inputElement.value = this
            inputElement.select()
            showMessage(
                document.execCommand("Copy", false) ?
                    langData.copySuccess : langData.copyFail
            )
        }
    )
}

String.prototype.getHash = function () {
    let hash = 0
    for (let i = 0; i < this.length; i++) {
        hash = ((hash << 5) - hash) + this.charCodeAt(i)
        hash = hash & hash
    }
    return Math.abs(hash)
}