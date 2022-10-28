import { config, cacheModel, dataCache, DATA_VERSION, getUrlData } from "./init.js";
import { mask, showMessage } from "./ui.js";
import { langData } from "./lang-loader.js";

/** 
 * @typedef {import('./command-builder').ParamVO} ParamVO 
 */

/**
 * @typedef { [string | ModalDTO] } ModalList
 */

/**
 * @typedef { object } ModalDTO
 * @property { string } id
 * @property { string } name
 */

/**
 * @typedef { object } ZippedModalList
 * @property { string } name
 * @property { [(string | number)[], string[]] } data
 */

/**
 * @param { string } id
 * @return { Promise<ModalList> }
 */
const getModalList = id =>
    getUrlData(`./data/${config.lang}/${DATA_VERSION}/${id}.json`, { unzip: true })

/**
 * @param { ZippedModalList } zippedModalList 
 * @return { ModalList }
 */
const unzipModalData = zippedModalList => {
    const modalList = []
    zippedModalList.forEach(modalGroup => {
        modalList.push(modalGroup.name)
        for (let index = 0; index < modalGroup.data[0].length; index++) {
            modalList.push({
                id: modalGroup.data[0][index],
                name: modalGroup.data[1][index]
            })
        }
    })
    return modalList
}

export { unzipModalData }

const modalSelectElement = document.getElementById('modal-select')
const modalSelectDataElement = document.getElementById('modal-select-data')

class ModalSelect {
    /** @param { string } type */
    constructor(type) {
        this.type = type
    }

    /** @param { ParamVO } bindParam */
    show(bindParam) {
        getModalList(this.type).then(modalList => {
            modalSelectElement.style.display = 'block'
            mask.onclick(e => this.hide()).show()

            /** @param { ModalList } modals */
            const loadModalSelectData = modals => {
                modals.forEach(modal => {
                    if (typeof modal === 'string') {
                        const groupNameElement = document.createElement('p')
                        groupNameElement.innerHTML = modal
                        modalSelectDataElement.appendChild(groupNameElement)
                        return
                    }

                    const div = document.createElement('div')
                    div.appendCommand(modal.id, modal.name)
                    modalSelectDataElement.appendChild(div)

                    div.addEventListener('click', e => {
                        console.log(bindParam)
                        bindParam.value = { label: modal.name, value: modal.id }
                        this.hide()
                    })
                })

                if (modals.length == 99)
                    modalSelectDataElement.addEventListener('scroll', loadMore)
            }

            let i = 0
            loadModalSelectData(modalList.slice(i, i + 99))

            modalSelectDataElement.addEventListener('scroll', loadMore)

            function loadMore(e) {
                if (e.target.scrollHeight - (e.target.clientHeight + e.target.scrollTop) > 260) return
                modalSelectDataElement.removeEventListener('scroll', loadMore)
                i = i + 100
                loadModalSelectData(modalList.slice(i, i + 99))
            }
        })
    }

    hide() {
        modalSelectElement.style.display = 'none'
        mask.hide()
        modalSelectDataElement.innerHTML = ''
    }
}

export { ModalSelect }