import { langData } from "./lang-loader.js"
import { config, ProxyItem } from "./init.js"
import { showMessage } from "./ui.js"
const { slideDown } = window.domSlider

/**
 * @typedef {import('./command-parser.js').CommandDTO} CommandDTO
 */

const servers = new ProxyItem('servers', {})

class TargetServer {
    /** @param { string } url */
    constructor(url) {
        /** @type { string } */
        this.url = url
        this.proxyParam = {
            cache: 'no-cache',
            // mode: "no-cors",
            headers: {
                'reqip': url
            }
        }
        this.uid = servers[url]?.uid ?? ''
        this.token = servers[url]?.token ?? ''
        this.ready = servers[url]?.verified ?? false
    }

    /** 
     * @param { object } data 
     * @return { RequestInit }
     */
    buildPostParam(data) {
        return {
            method: 'post',
            body: JSON.stringify(data),
            headers: {
                'reqip': this.url,
                'Content-Type': 'application/json'
            }
        }
    }

    async getInfo() {
        showMessage(langData.gettingServerInfo, 5000)
        return fetch(`/status/server`, this.proxyParam)
            .then(p => p.json()).then(data => {
                console.log(data)
                showMessage(langData.getServerInfoSuccess)
                return data
            }).catch(showMessage(langData.getServerInfoFail, 5000))
    }

    async testCommandPlugin() {
        const that = this
        return fetch(`/opencommand/api`, this.proxyParam)
            .then(p => p.json()).catch(e => that.ready = false)
    }

    /** @param { string | number } uid */
    async sendVerifycode(uid) {
        const that = this
        return fetch(`/opencommand/api`, this.buildPostParam({
            action: 'sendCode',
            data: uid
        })).then(p => p.json()).then(data => {
            that.token = data.token
            servers[that.url] = {
                uid: uid,
                token: data.token
            }
            return data
        })
    }

    /** @param { string | number } code */
    async checkVerifycode(code) {
        const that = this
        return fetch(`/opencommand/api`, this.buildPostParam({
            action: 'verify',
            token: that.token,
            data: code
        })).then(p => p.json()).then(data => {
            if (data.retcode !== 200) throw new Error()
            that.ready = true
            servers[that.url] = {
                uid: servers[url].uid,
                token: servers[url].token,
                verified: true
            }
            return data
        })
    }

    /** @param { CommandDTO[] } commandList */
    async execCommand(commandList) {
        if (!commandList?.length) {
            showMessage(langData.commandEmpty, 3000)
            return
        }
        const that = this
        let commandListString = ''
        commandList.forEach(command => {
            commandListString += OutputCommand.stringify(command) + '\n'
        })
        return fetch(`/opencommand/api`, this.buildPostParam({
            action: 'command',
            token: that.token,
            data: commandListString
        })).then(p => p.json()).then(data => {
            showMessage(langData.commandExecuted)
            return data
        }).catch(e => showMessage(langData.commandExecuteFail, 3000))
    }

    clearData() {
        servers[this.url] = {}
        this.uid = ''
        this.token = ''
        this.ready = false
    }
}

let server = config.server ? new TargetServer(config.server) : undefined

export { server }

const playerCountElement = document.getElementById('remote-player-count')
const serverVersionElement = document.getElementById('remote-server-version')
const serverVerifyElement = document.getElementById('server-verify')
const remoteExecuteStatusElement = document.getElementById('remote-execute-status')
const serverHostInput = document.getElementById('remote-host')

serverHostInput.addEventListener('change', e => {
    if (!e.target.value.startsWith('https://')) e.target.value = 'https://' + e.target.value
    server = new TargetServer(e.target.value)

    server.getInfo().then(data => {
        if (!data) throw new Error()
        const status = data.status
        serverVersionElement.innerText = status.version

        playerCountElement.innerText = status.maxPlayer <= 0 ?
            status.playerCount : `${status.playerCount} / ${status.maxPlayer}`

    }).catch(() => {
        showMessage(cannotConnectServer)
        remoteExecuteStatusElement.innerHTML = langData.cannotConnectServer
        serverVersionElement.innerText = langData.getServerInfoFail
    })

    server.testCommandPlugin().then(data => {
        if (!data?.retcode) throw new Error()

        if (config?.tokens[server.url]) return data

        remoteExecuteStatusElement.innerHTML = langData.unboundPlayer
        slideDown({ element: serverVerifyElement })
    }).catch(() => {
        remoteExecuteStatusElement.innerHTML = langData.serverNotSupport
    })


    const uidElement = document.getElementById('remote-uid')
    const sendVerifycodeElement = document.getElementById('send-verifycode')

    sendVerifycodeElement.addEventListener('click', () => {
        server.sendVerifycode(uidElement.value).then(() => {
            showMessage(langData.playerVerifySuccess)
            remoteExecuteStatusElement.innerHTML = langData.playerVerifySuccess
        }).catch(() => {
            showMessage(langData.verifycodeError)
            remoteExecuteStatusElement.innerHTML = langData.playerVerifyFail
        })
    })
})