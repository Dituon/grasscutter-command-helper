import {config, DATA_VERSION, getUrlData} from "../app/init.js";
import {mask} from "../ui/ui.js";
import {langData} from "../app/lang-loader.js";

import './modal.css'

/** 
 * @typedef {import('./command-builder.js').ParamVO} ParamVO
 */

/**
 * @typedef { {name: string, children: ModalDTO[]}[] } ModalList
 */

/**
 * @typedef { object } ModalDTO
 * @property { string | number } [id]
 * @property { string[] | number[] } [ids]
 * @property { string } name
 * @property { string } [icon]
 * @property { string[] } [filter]
 * @property { ModalDTO[] } [children]
 */

/**
 * @typedef { object } ZippedModalList
 * @property { string } name
 * @property { [(string | number)[], string[]] } data
 */

/**
 * @typedef { {name: string, filters: string[]} } FilterGroup
 */

/**
 * @param { string } id
 * @return { Promise<ModalDTO[]> }
 */
export const getModalList = id =>
    getUrlData(`/data/${config.lang}/${DATA_VERSION}/${id}.json`
        // , { unzip: true }
    )

/**
 * @return { Promise<ModalDTO> }
 */
export const getModalById = async (modalId, modalListId) => {
    const modalList = await getModalList(modalListId);
    for (const modal of modalList) {

        if (
            (modal.id && modal.id == modalId)
            || (modal.ids && modal.ids.includes(modalId))
        ) {
            return modal
        } else if (modal.children) {
            for (const child of modal.children) {
                if (child.id == modalId) return modal
                if (child.ids && child.ids.includes(modalId)) return modal
            }
        }
    }
    throw new Error(`ModalId ${modalId} in ${modalListId} notfound`)
}

/**
 * @return { Promise<FilterGroup[]> }
 */
const getFilterGroupList = id => getUrlData(`/data/${config.lang}/${DATA_VERSION}/menu.json`, { showMessage: false })
    .then(menus => menus.filter(m => m.type === id))
    .then(menus => {
        if (!menus?.length) throw new Error()
        const filterGroupList = []
        menus.forEach(menu => {
            filterGroupList.push(...menu.filterGroups)
        })
        return filterGroupList
    })

/**
 * @param { ZippedModalList } zippedModalList 
 * @return { ModalDTO[] }
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
    return modalList
}

export { unzipModalData }

const modalSelectElement = document.getElementById('modal-select')
const modalSelectDataElement = document.getElementById('modal-select-data')
const modalSearchInput = document.getElementById('modal-search')
const modalSelectCloseElement = document.getElementById('modal-search-clear')
const modalSearchSettingElement = document.getElementById('modal-srarch-setting')


class ModalSelect {
    type
    /** @type { ParamVO } */
    param
    /** @type { HTMLDivElement } */
    #filterDetails
    /** @type { [string | ModalDTO] } */
    displayList

    /** @param { ParamVO } param */
    constructor(param) {
        this.type = param.type
        this.param = param
        modalSearchInput.select = this
        modalSearchInput.addEventListener('change', this.#onFiltrate)
        modalSelectCloseElement.addEventListener('click', this.clear)
        modalSearchSettingElement.innerHTML = ''

        getFilterGroupList(this.type).then(filterGroupList => {
            this.#filterDetails = document.createElement('details')
            const summary = document.createElement('summary')
            summary.innerHTML = langData.showFilter
            this.#filterDetails.appendChild(summary)

            filterGroupList.forEach(filterGroup => {
                const groupDiv = document.createElement('div')

                const title = document.createElement('p')
                title.innerHTML = filterGroup.name
                groupDiv.appendChild(title)

                filterGroup.filters.forEach(filter => {
                    filter = filter.replace(' ', '-')
                    groupDiv.appendPreTag(filter, () => {
                        modalSearchInput.value += ` ${filter} `
                        this.show(modalSearchInput.value)
                    })
                })

                this.#filterDetails.appendChild(groupDiv)
            })
            modalSearchSettingElement.appendChild(this.#filterDetails)
        })
    }

    /** @param {string} [keyword] */
    show(keyword) {
        modalSelectDataElement.innerHTML = ''
        modalSelectDataElement.removeEventListener('scroll', this.#loadMore)

        getModalList(this.type).then(modalList => {
            modalSelectElement.classList.remove('hide')
            mask.onclick = e => this.hide()
            mask.show()

            let filteredModalGroupList = modalList

            if (keyword) {
                const keywordList = keyword.trim().split(/\s+/)

                filteredModalGroupList = modalList.reduce((filteredArr, modal) => {
                    let flag = modal.name.includesMultiple(...keywordList)

                    if (!flag && modal.filter
                        && modal.filter.map(tag => tag.replace(' ', '-')).includesMultiple(...keywordList)
                    ) {
                        flag = true
                    }
                    if (!flag && modal.children) for (const children of modal.children) {
                        if (
                            children.name.includesMultiple(...keywordList)
                            || (children.id && keywordList.includes(children.id))
                            || (children.ids && children.ids.find(id => keywordList.includes(String(id))))
                        ) {
                            flag = true
                            break
                        }
                    }

                    if (flag) filteredArr.push(modal)
                    return filteredArr
                }, [])
            }

            this.displayList = filteredModalGroupList

            this.#loadModalSelectData(this.displayList.slice(0, 99))
            if (this.displayList.length > 100) modalSelectDataElement.addEventListener('scroll', this.#loadMore)
        })
    }

    #loadMore(e){
        if (e.target.scrollHeight - (e.target.clientHeight + e.target.scrollTop) > 260) return
        modalSelectDataElement.removeEventListener('scroll', this.#loadMore)
        let i = modalSelectDataElement.childElementCount
        this.#loadModalSelectData(this.displayList.slice(i, i + 99))
    }

    /** @param { ModalDTO[] } modals */
    #loadModalSelectData(modals) {
        modals.forEach(modal => {
            try {
                if (!modal.children?.length && (modal.id || modal.ids?.length)) {
                
                    let id = modal.id ?? modal.ids[0]
    
                    const div = document.createElement('div')
    
                    if (modal.icon) {
                        const icon = document.createElement('img')
                        icon.className = 'icon'
                        icon.src = modal.icon
                        div.appendChild(icon)
                    }
                    div.appendCommand(id, modal.name)
                    if (modal.filter) div.appendTag(...modal.filter)
                    modalSelectDataElement.appendChild(div)
    
                    div.addEventListener('click', e => {
                        this.param.value = { label: modal.name, value: id }
                        this.hide()
                    })
    
                    return
                }
    
                const details = document.createElement('details')
                const summary = document.createElement('summary')
    
                summary.innerHTML = modal.name
                if (modal.filter) summary.appendTag(
                    ...modal.filter.map(tag => tag.replace(' ', '-'))
                )
                details.appendChild(summary)
    
                modal.children.forEach(child => {
                    const div = document.createElement('div')
                    if (child.icon) {
                        const icon = document.createElement('img')
                        icon.className = 'icon'
                        icon.src = child.icon
                        div.appendChild(icon)
                    }
    
                    let id = child.id ?? child.ids[0]
    
                    div.appendTag(child.type)
                    div.appendCommand(id, child.name)
                    details.appendChild(div)
    
                    div.addEventListener('click', e => {
                        this.param.value = { label: child.name, value: id }
                        this.hide()
                    })
                })
    
                modalSelectDataElement.appendChild(details)
            } catch (e) {
                console.error(e)
            }
        })

        if (modals.length == 99)
            modalSelectDataElement.addEventListener('scroll', this.#loadMore)
    }

    hide() {
        modalSearchInput.select = null
        modalSearchInput.value = ''
        modalSelectDataElement.removeEventListener('scroll', this.#loadMore)
        modalSearchInput.removeEventListener('change', this.#onFiltrate)
        modalSelectCloseElement.removeEventListener('click', this.clear)
        modalSelectElement.classList.add('hide')
        mask.hide()
    }

    /** @param { Event } */
    #onFiltrate() {
        this.show(modalSearchInput.value)
    }

    clear = () => {
        modalSearchInput.value = ''
        this.show()
    }
}

export { ModalSelect }