import { showMessage, mask, Icon } from './ui.js'
import { DATA_VERSION, cacheModel, config, dataCache, getUrlData } from './init.js'
import { langData } from './lang-loader.js'
import { OutputCommandList, OutputCommand, OutputParam } from './command-builder.js'
import { ModalSelect } from './modal-loader.js'

/**
 * @typedef {import('./command-builder.js').CommandVO} CommandVO
 * @typedef {import('./command-builder.js').ParamVO} ParamVO
 * @typedef {import('./command-builder.js').OutputCommand} OutputCommand
 * @typedef {import('./command-builder.js').OutputParam} OutputParam
 */

/** @type { HTMLInputElement } */
const commandSearchInput = document.getElementById('search-input')

/** @return { Promise<CommandVO[]> } */
const getCommandList = () =>
    getUrlData(`./data/${config.lang}/CommandList-${config.commandVersion}.json`)

/** @type { Map<string, CommandVO> } */
const commandMap = new Map()

/** @return { Promise<CommandVO> } */
const getCommandById = async id => {
    if (commandMap.has(id)) return commandMap.get(id)
    return getCommandList().then(commandList => {
        commandList.forEach(command => commandMap.set(command.id, command))
        return commandMap.get(id)
    })
}

export { getCommandList, getCommandById }

/** 
 * @param { string } version 
 * @return { Promise<OutputCommandList> }
 */
const initCommand = version => {
    config.commandVersion = version
    getCommandList().then(data => {
        const outputCommandList = new OutputCommandList(data)
        loadCommand(outputCommandList.list)
        return outputCommandList
    })
}

/** @type { HTMLSelectElement } */
const commandVersionSelectElement = document.getElementById('command-version-select')

initCommand(config.commandVersion ?? commandVersionSelectElement.value)
getCommandList().then(commandList => {
    commandVersionSelectElement.addEventListener('change', e => {
        initCommand(e.target.value).then(commandList => {
            let keyword = commandSearchInput.value
            loadCommand(keyword ? commandList.filter(keyword) : commandList.list)
        })
    })
    commandSearchInput.addEventListener('change', e => {
        loadCommand(commandList.filter(e.target.value))
    })
})

/**
 * @param { CommandVO[] } commandList
 */
const loadCommand = commandList => {
    const commandListElement = document.getElementById('command-list')
    commandListElement.innerHTML = ''

    commandList.forEach(command => {
        const commandElement = document.createElement('div')
        commandElement.className = 'card'

        const radio = document.createElement('input')
        radio.type = 'radio'
        radio.name = 'command'

        commandElement.appendChild(radio)
        commandElement.appendCommand(command.head, command.label)
        commandListElement.appendChild(commandElement)

        commandElement.addEventListener('click', e => {
            radio.checked = true
            loadParam(command)
        })
    })
}

/** 
 * @param { OutputCommand } command 
 */
const loadParam = command => {
    const paramsElement = document.getElementById('params')
    paramsElement.innerHTML = ''

    if (!command?.params?.length) paramsElement.innerText = langData.noParam

    command.params.forEach(param => {
        paramsElement.appendChild(buildParamElement(param))
    })

    command.build()
}

/**
 * @param { OutputParam } param
 * @return { HTMLElement }
 */
const buildInputElement = param => {
    let inputElement
    switch (param.type) {
        case 'number':
            inputElement = document.createElement('input')
            inputElement.type = 'number'
            inputElement.max = param.max
            inputElement.min = param.min
            inputElement.placeholder = langData.placeholder + param.name
            break
        case 'string':
            inputElement = document.createElement('input')
            inputElement.type = 'text'
            inputElement.placeholder = langData.placeholder + param.name
            break
        case 'select':
            inputElement = document.createElement('select')
            if (param.data) {
                for (let j = 0; j < param.data.value.length; j++) {
                    const option = document.createElement('option')
                    option.value = param.data.value[j]
                    option.innerHTML = param.data.label[j]
                    inputElement.appendChild(option)
                }
            }
            inputElement.placeholder = langData.placechooser + param.name
            break
        default:
            inputElement = document.createElement('div')
            inputElement.className = 'modal-select-input'
            inputElement.placeholder = langData.placechooser + param.name
            inputElement.setAttribute('readonly', 'readonly')

            inputElement.addEventListener('click', e => {
                const modalSelect = new ModalSelect(param.type)
                modalSelect.show(param)
            })
    }
    param.inputElement = inputElement

    if (param.required && param.value) param.build()

    inputElement.addEventListener('change', e => {
        param.value = e.target.value
    })

    return inputElement
}

/**
 * @param { ParamVO } param
 */
const buildParamElement = param => {
    const div = document.createElement('div')
    const inputDiv = document.createElement('div')
    div.className = 'param'
    const span = document.createElement('span')
    span.className = param.required ? 'required-param' : 'optional-param'
    span.innerHTML = param.name
    div.appendChild(span)

    inputDiv.appendChild(buildInputElement(param))

    if (param.subparam) {
        const subParamElement = buildInputElement(param.subparam, false)
        subParamElement.className = 'sub-param'
        subParamElement.placeholder = param.subparam.name
        inputDiv.appendChild(subParamElement)
    }

    div.appendChild(inputDiv)
    return div
}

/**
 * @param {ParamVO} param
 */
const showModalSelect = (modalList, param) => {
    const modalSelectElement = document.getElementById('modal-select')
    const modalSelectDataElement = document.getElementById('modal-select-data')

    modalSelectElement.style.display = modalList ? 'block' : 'none'
    if (!modalList) {
        mask.hide()
        return
    }
    mask.onclick(e => showModalSelect()).show()

    modalSelectDataElement.innerHTML = ''

    let i = 0
    loadModalSelectData(modalList.slice(i, i + 99))

    modalSelectDataElement.addEventListener('scroll', loadMore)

    function loadMore(e) {
        if (e.target.scrollHeight - (e.target.clientHeight + e.target.scrollTop) > 260) return
        modalSelectDataElement.removeEventListener('scroll', loadMore)
        i = i + 100
        loadModalSelectData(modalList.slice(i, i + 99))
    }

    function loadModalSelectData(modalList) {
        modalList.forEach(modal => {
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
                param.value = { label: modal.name, value: modal.id }
                showModalSelect()
            })
        })

        if (modalList.length == 99)
            modalSelectDataElement.addEventListener('scroll', loadMore)
    }
}

const commandListElement = document.getElementById('list')
const commandListIcon = new Icon('command-list-icon', { switchable: false })
document.getElementById('list-hide').addEventListener('click', e => {
    commandListElement.style.display = 'none'
    commandListIcon.show()
})

commandListIcon.onShow(e => {
    commandListElement.style.display = 'block'
    commandListIcon.hide()
})