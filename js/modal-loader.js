import { config, cacheModel, dataCache, DATA_VERSION, getUrlData } from "./init.js";
import { mask, showMessage } from "./ui.js";
import { langData } from "./lang-loader.js";

/** 
 * @typedef {import('./command-builder').ParamVO} ParamVO 
 */

/**
 * @typedef { {name: string, children: ModalDTO[]}[] } ModalList
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
    getUrlData(`./data/${config.lang}/${DATA_VERSION}/${id}.json`
        // , { unzip: true }
    )

/**
 * @param { ZippedModalList } zippedModalList 
 * @return { ModalList }
 */
const unzipModalData = zippedModalList => {
    const modalList = []
    zippedModalList.forEach(modalGroup => {
        const classify = { name: modalGroup.name, children: [] }
        for (let index = 0; index < modalGroup.data[0].length; index++) {
            classify.children.push({
                id: modalGroup.data[0][index],
                name: modalGroup.data[1][index]
            })
        }
        modalList.push(classify)
    })
    console.log(modalList)
    return modalList
}

export { unzipModalData }

const modalSelectElement = document.getElementById('modal-select')
const modalSelectDataElement = document.getElementById('modal-select-data')
const modalSearchInput = document.getElementById('modal-search')
const modalSelectCloseElement = document.getElementById('modal-search-clear')

class ModalSelect {
    /** @param { ParamVO } param */
    constructor(param) {
        this.type = param.type
        this.param = param
        modalSearchInput.select = this
        modalSearchInput.addEventListener('change', this.#onFiltrate)
        modalSelectCloseElement.addEventListener('click', this.clear)
    }

    /** @param {string} [keyword] */
    show(keyword) {
        console.log(keyword)
        modalSelectDataElement.innerHTML = ''
        modalSelectDataElement.removeEventListener('scroll', this.#loadMore)

        getModalList(this.type).then(modalList => {
            modalSelectElement.style.display = 'block'
            mask.onclick(e => this.hide()).show()

            // let filteredModalGroupList
            // if (keyword) filteredModalGroupList = modalList.filter(group => group.name.includes(keyword))
            // // if (filteredModalGroupList?.length) keyword = undefined
            // else filteredModalGroupList = modalList

            const filteredModalGroupList = keyword ?
                modalList.filter(group =>
                    group.name.includes(keyword)
                ) : modalList

            /** @type { [string | ModalDTO] } */
            this.displayList = filteredModalGroupList
            // filteredModalGroupList.forEach(group => {
            //     // if (!keyword) {
            //         console.log(group)
            //         this.displayList.push(group)
            //         // this.displayList.push(group.name)
            //         // this.displayList.push(...group.children)
            //         return
            //     // }
            //     // group.children.forEach(modal => {
            //     //     if (modal.name.includes(keyword) || modal.id.includes(keyword))
            //     //         this.displayList.push(modal)
            //     // })
            // })

            this.#loadModalSelectData(this.displayList.slice(0, 99))
            modalSelectDataElement.addEventListener('scroll', this.#loadMore)
        })
    }

    #loadMore = e => {
        if (e.target.scrollHeight - (e.target.clientHeight + e.target.scrollTop) > 260) return
        modalSelectDataElement.removeEventListener('scroll', this.#loadMore)
        let i = modalSelectDataElement.childElementCount
        console.log(this.displayList)
        this.#loadModalSelectData(this.displayList.slice(i, i + 99))
    }

    /** @param { ModalList } children */
    #loadModalSelectData(children) {
        children.forEach(modal => {
            // if (typeof modal === 'string') {
            //     const groupNameElement = document.createElement('p')
            //     groupNameElement.innerHTML = modal
            //     modalSelectDataElement.appendChild(groupNameElement)
            //     return
            // }

            if (modal.children?.length) {
                const details = document.createElement('details')
                const summary = document.createElement('summary')
                
            }

            const div = document.createElement('div')
            div.appendCommand(modal.id, modal.name)
            modalSelectDataElement.appendChild(div)

            div.addEventListener('click', e => {
                this.param.value = { label: modal.name, value: modal.id }
                this.hide()
            })
        })

        if (children.length == 99)
            modalSelectDataElement.addEventListener('scroll', this.#loadMore)
    }

    hide = () => {
        modalSearchInput.select = null
        modalSearchInput.value = ''
        modalSearchInput.removeEventListener('change', this.#onFiltrate)
        modalSelectCloseElement.removeEventListener('click', this.clear)
        modalSelectElement.style.display = 'none'
        mask.hide()
    }

    /** @param { Event } */
    #onFiltrate() {
        this.select.show(modalSearchInput.value)
    }

    clear = () => {
        modalSearchInput.value = ''
        this.show()
    }
}

export { ModalSelect }