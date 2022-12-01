import { config, servers } from "./init.js"
import { langData } from "./lang-loader.js"
import { showMessage } from "./ui.js"
import { settingBar } from "./setting.js"
import { OutputCommand } from "./command-builder.js"

/**
 * @typedef {import('./command-parser.js').CommandDTO} CommandDTO
 */

const serverHostInput = document.getElementById('remote-host')
const playerCountElement = document.getElementById('remote-player-count')
const serverVersionElement = document.getElementById('remote-server-version')
const serverVerifyElement = document.getElementById('server-verify')
const remoteExecuteStatusElement = document.getElementById('remote-execute-status')
const serverInfoElement = document.getElementById('server-info')


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

        config.server = url
        serverHostInput.value = url
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
            }).then(data => {
                if (!data) throw new Error()
                const status = data.status
                serverVersionElement.innerText = status.version
                playerCountElement.innerText = status.maxPlayer <= 0 ?
                    status.playerCount : `${status.playerCount} / ${status.maxPlayer}`

                serverInfoElement.className = ''
                return data
            }).catch(() => {
                showMessage(langData.cannotConnectServer)
                remoteExecuteStatusElement.innerHTML = langData.cannotConnectServer
                serverVersionElement.innerText = langData.getServerInfoFail
            })
    }

    async testCommandPlugin() {
        const that = this
        return fetch(`/opencommand/api`, this.buildPostParam({
            action: 'ping'
        })).then(p => p.json()).then(data => {
            if (!data?.retcode) throw new Error()
            if (servers[this.url]?.token) {
                remoteExecuteStatusElement.innerHTML =
                    langData.playerBound.replace('$UID', this.uid)
                return
            }

            serverVerifyElement.className = ''
            remoteExecuteStatusElement.innerHTML = langData.unboundPlayer
        }).catch(() => {
            that.ready = false
            remoteExecuteStatusElement.innerHTML = langData.serverNotSupport
        })
    }

    /** @param { number } uid */
    async sendVerifycode(uid) {
        const that = this
        return fetch(`/opencommand/api`, this.buildPostParam({
            action: 'sendCode',
            data: uid
        })).then(p => p.json()).then(data => {
            if (data.retcode === 404) {
                showMessage(langData.playerNotFound, 3000)
                remoteExecuteStatusElement.innerHTML = langData.playerNotFound
                throw new Error(data.message)
            }
            if (data.retcode === 403) {
                showMessage(langData.requestsTooFrequent, 3000)
                remoteExecuteStatusElement.innerHTML = langData.requestsTooFrequent
                throw new Error(data.message)
            }
            if (data.retcode !== 200) {
                showMessage(langData.unknowError, 3000)
                remoteExecuteStatusElement.innerHTML = langData.unknowError
                throw new Error(data.message)
            }
            that.token = data.data
            servers[that.url] = {
                uid: uid,
                token: data.data
            }
            showMessage(langData.verifycodeSended)
            remoteExecuteStatusElement.innerHTML = langData.verifycodeSended
            return data
        }).catch(e => {
            console.warn(e)
        })
    }

    /** @param { number } code */
    async checkVerifycode(code) {
        const that = this
        return fetch(`/opencommand/api`, this.buildPostParam({
            action: 'verify',
            token: that.token,
            data: code
        })).then(p => p.json()).then(data => {
            if (data.retcode === 403) {
                showMessage(langData.requestsTooFrequent, 3000)
                remoteExecuteStatusElement.innerHTML = langData.requestsTooFrequent
                throw new Error(data.message)
            }
            if (data.retcode !== 200) throw new Error(data.message)
            that.ready = true
            servers[that.url] = {
                uid: servers[that.url].uid,
                token: servers[that.url].token,
                verified: true
            }

            showMessage(langData.verifySuccess)
            remoteExecuteStatusElement.innerHTML = langData.verifySuccess
            return data
        }).catch(e => console.warn(e))
    }

    /** @param { CommandDTO[] } commandList */
    async execCommand(commandList) {
        if (!commandList?.length) {
            showMessage(langData.commandEmpty, 3000)
            return
        }
        const that = this
        return fetch(`/opencommand/api`, this.buildPostParam({
            action: 'command',
            token: that.token,
            data: commandList.reduce((str, command) =>
                str += OutputCommand.stringify(command).replace('/', '') + '\n'
                , '')
        })).then(p => p.json()).then(data => {
            showMessage(langData.commandExecuted)
            return data
        }).catch(e => {
            showMessage(langData.commandExecuteFail, 3000)
        })
    }

    clearData() {
        servers[this.url] = {}
        this.uid = undefined
        this.token = undefined
        this.ready = false
    }
}

export let server = config.server ? new TargetServer(config.server) : undefined
/** @param { string } url */
export const setServer = url => {
    server = new TargetServer(url)
    server.getInfo()
    server.testCommandPlugin()
}

if (config.server) {
    server.getInfo()
    server.testCommandPlugin()
}

/** @param { CommandDTO[] } commandList */
export const execCommand = commandList => {
    if (!server) {
        showMessage(langData.serverNotDefined, 3000)
        settingBar.show()
        return
    }
    server.execCommand(commandList)
}


serverHostInput.addEventListener('change', e => {
    if (!e.target.value.startsWith('https://')) e.target.value = 'https://' + e.target.value
    server = new TargetServer(e.target.value)

    server.getInfo()
    server.testCommandPlugin()

    const uidElement = document.getElementById('remote-uid')
    const sendVerifycodeBtn = document.getElementById('send-verifycode')
    sendVerifycodeBtn.onclick = () => {
        server.sendVerifycode(parseInt(uidElement.value))
    }

    const verifycodeInput = document.getElementById('remote-verifycode')
    const checkVerifycodeBtn = document.getElementById('check-verifycode')
    checkVerifycodeBtn.onclick = () => {
        server.checkVerifycode(parseInt(verifycodeInput.value))
    }
})