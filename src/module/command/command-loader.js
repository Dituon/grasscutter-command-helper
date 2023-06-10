import {Icon} from '../ui/ui.js'
import {config, getUrlData} from '../app/init.js'
import {langData} from '../app/index.js'
import {OutputCommand, OutputCommandList, OutputParam} from './command-builder.js'
import {ModalSelect} from './modal-select-loader.js'

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
    getUrlData(`/data/${config.lang}/CommandList-${config.commandVersion ?? '1.6.1'}.json`)

/** @type { Map<string, CommandVO> } */
export const commandMap = new Map()

/** @return { Promise<CommandVO> } */
const getCommandByIdAsync = async id => {
    return getCommandList().then(commandList => {
        commandList.forEach(command => commandMap.set(command.id, command))
        return commandMap.get(id)
    })
}

getCommandByIdAsync()

/** @return { CommandVO } */
const getCommandById = id => {
    return commandMap.get(id)
}

export { getCommandList, getCommandById, getCommandByIdAsync }

/** 
 * @param { string } [version = '1.6.1'] 
 * @return { Promise<OutputCommandList> }
 */
export const initCommand = async version => {
    config.commandVersion = version ?? config.commandVersion ?? '1.6.1'
    const data = await getCommandList()
    const commandList = new OutputCommandList(data)
    loadCommand(commandList.list)
    commandSearchInput.onchange = e => {
        loadCommand(commandList.filter(command =>
            command.head.includes(e.target.value)
            || command.label.includes(e.target.value)
        ))
    }
    return commandList
}

/** @type { HTMLSelectElement } */
export const commandVersionSelectElement = document.getElementById('command-version-select')
if (config.commandVersion) commandVersionSelectElement.value = config.commandVersion
commandVersionSelectElement.addEventListener('change', e => {
    initCommand(e.target.value).then(commandList => {
        let keyword = commandSearchInput.value
        loadCommand(keyword ? commandList.filter(keyword) : commandList.list)
    })
})

initCommand(config.commandVersion ?? commandVersionSelectElement.value)

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

            inputElement.addEventListener('click', e => {
                const modalSelect = new ModalSelect(param)
                modalSelect.show()
            })
    }
    param.inputDom = inputElement

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
        const subParamElement = buildInputElement(param.subparam)
        subParamElement.className = 'sub-param'
        subParamElement.placeholder = param.subparam.name
        inputDiv.appendChild(subParamElement)
    }

    div.appendChild(inputDiv)
    return div
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