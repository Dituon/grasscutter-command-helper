import { CommandMenu } from "./command-menu.js"
import { updatedList } from "./init.js"
import { langData } from "./lang-loader.js"
import { mask, showMessage } from "./ui.js"

const modalElement = document.getElementById('share-modal')
const modalUpdate = document.getElementById('export-update')
const modalExportRaw = document.getElementById('export-raw')
const modalDownload = document.getElementById('import-download')
const modalImportRaw = document.getElementById('import-raw')
/** @type { HTMLInputElement } */
const modalCodeImport = document.getElementById('share-code')

export class ShareModal {
    /** @type { CommandMenu } */
    #menu
    #hash

    /**
     * @param { CommandMenu } menu 
     */
    constructor(menu) {
        this.#menu = menu
        mask.onclick = () => this.hide()

        modalUpdate.addEventListener('click', () => this.#update())
        modalDownload.addEventListener('click', () => {
            if (!modalCodeImport.value.length) {
                showMessage(langData.shareCodeEmpty)
                return
            }
            this.download()
        })
        modalExportRaw.addEventListener('click', () => this.copyRaw())
        modalImportRaw.addEventListener('click', () => this.readRaw())
    }

    show() {
        modalElement.classList.remove('hide')
        mask.show()
    }

    hide() {
        modalElement.classList.add('hide')
        mask.hide()
    }

    #update() {
        const param = this.#buildPostParam()
        if (updatedList.includes(this.#hash)) return

        fetch(window.location.origin + '/api', param)
            .then(p => p.json())
            .then(res => {
                if (res.retcode != 200){
                    showMessage(langData.updateFail)
                    return
                }
                modalCodeImport.value = this.#hash;
                updatedList.push(this.#hash)

                `URL: ${window.location.origin + window.location.pathname}?import=${this.#hash}\n\nCode: ${this.#hash}`.copy()
            })
            .catch(() => showMessage(langData.cannotConnectServer))
    }

    /** 
     * @return { RequestInit }
     */
    #buildPostParam() {
        const str = this.#menu.exportChosenCommand()
        this.#hash = str.getHash()
        return {
            method: 'post',
            body: str,
            headers: {
                'hash': this.#hash,
                'Content-Type': 'application/json'
            }
        }
    }

    /**
     * @param { number | string } [code] 
     */
    download(code) {
        code = code ?? modalCodeImport.value
        fetch(`${window.location.origin}/share/${code}.gmh`).then(p => p.text())
            .then(raw => {
                this.#menu.importCommand(raw)
            }).catch(e => {
                showMessage(langData.commandImportFail)
            })
    }

    copyRaw() {
        this.#menu.exportChosenCommand().copy()
    }

    readRaw() {
        this.#menu.importCommandFromClipboard()
            .catch(e => showMessage(langData.commandImportFail))
    }
}