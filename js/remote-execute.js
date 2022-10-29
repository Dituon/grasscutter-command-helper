import { langData } from "./lang-loader.js"
import { showMessage } from "./ui.js"

class TargetServer {
    /** @param { string } url */
    constructor(url) {
        /** @type { string } */
        this.url = url
        this.proxyParam = {
            cache: 'no-cache',
            headers: {
                'reqip': url
            }
        }
    }

    async getInfo() {
        showMessage(langData.gettingServerInfo, 5000)
        return fetch(`/status/server`, this.proxyParam)
            .then(promise => promise.json()).then(data => {
                showMessage(langData.getServerInfoSuccess)
                return data
            }).catch(showMessage(langData.getServerInfoFail, 5000))
    }

    async testCommandPlugin() {
        return fetch(`/opencommand/api`, this.proxyParam)
            .then(promise => promise.json())
    }

}

document.getElementById('remote-host').addEventListener('change', e => {
    if (!e.target.value.startsWith('https://')) e.target.value = 'https://' + e.target.value
    const serevr = new TargetServer(e.target.value)
    serevr.getInfo().then(data => {
        console.log(data)
    })
})