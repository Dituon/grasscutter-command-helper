import { getCommandById } from "./command-loader.js"
import { config } from "./init.js"
import { execCommand } from "./remote-execute.js"

/**
 * @typedef {import('./command-parser.js').CommandDTO} CommandDTO
 * @typedef {import('./command-parser.js').ParamDTO} ParamDTO
 */

/**
 * @typedef { object } CommandVO
 * @property { string } id
 * @property { string } head
 * @property { string } label
 * @property { string } [name]
 * @property { ParamVO[] } [params]
 */

/**
 * @typedef { object } ParamVO
 * @property { string } type
 * @property { string } name
 * @property { string } [symbol]
 * @property { string } [head]
 * @property { boolean } required
 * @property { ParamValue | string | number } [value]
 * @property { ParamVO } [subparam]
 */

/**
 * @typedef { object } ParamValue
 * @property { string } label
 * @property { string } value
 */

class OutputCommandList {
    /** @param { CommandVO[] } commandList */
    constructor(commandList) {
        /** @type { OutputCommand[] } */
        this.list = commandList.map(command => new OutputCommand(command))
    }

    /**
     * 通过 `head` 或 `label` 过滤 `command`, 返回新数组
     * @param { string } text 
     * @returns { OutputCommand[] }
     */
    filter(text) {
        return this.list.filter(command => {
            return command.head.includes(text) || command.label.includes(text)
        })
    }
}

/**
 * 实现 {@link CommandVO} 数据接口
 * 
 * 构建 {@link OutputParam} 
 */
class OutputCommand {
    /** @param { CommandVO } commandVO */
    constructor(commandVO) {
        Object.assign(this, commandVO)
        if (!this.params) return
        this.params = commandVO.params.map(param => new OutputParam(param, this))
        this.version = config.version
    }

    build() { buildCommand(this) }

    /** 
     * @see {@link ParamVO} 
     * @return { CommandDTO } 
     */
    getDTO() {
        /** @type { CommandDTO } */
        return {
            id: this.id,
            params: this.params.map(param => param.getDTO())
        }
    }

    /** 
     * @param { CommandDTO } commandDTO
     * @return { string }
     */
    static stringify(commandDTO) {
        return commandDTO.params.reduce((str, param) => {
            if (!param) return str
            return str += ' ' + param
        }, getCommandById(commandDTO.id).head)
    }
}

/**
 * 实现并拓展 {@link ParamVO} 数据接口
 * 
 * 需指定 Parent{@link CommandVO}
 * 
 * 代理 `.value`, 与输出DOM绑定
 * 
 * @property { number } [min]
 * @property { number } [max]
 * @property { ParamValue } [_value]
 * @property { HTMLElement } inputDom
 */
class OutputParam {
    /** 
     * @param { ParamVO } paramVO
     * @param { OutputCommand } parentCommand
     */
    constructor(paramVO, parentCommand) {
        Object.assign(this, paramVO)
        this.parent = parentCommand
        this.isModalSelect = !['number', 'text', 'select'].includes(this.type)
        if (this.subparam) {
            this.subparam.isSub = true
            this.subparam = new OutputParam(this.subparam, parentCommand)
        }

        const that = this
        this.value = paramVO.value
        Object.defineProperty(this, 'value', {
            get() {
                return paramVO.value
            },
            /** @param { ParamValue } target */
            set(target) {
                paramVO.value = target
                buildCommand(that.parent)
                if (!this.inputDom) return
                that.isModalSelect ? this.inputDom.injectCommand(
                    target.value, target.label
                ) : this.inputDom.value = target
            }
        })
    }

    build() { this.value = this.value }

    /** 
     * 导出原始数据, 返回新对象
     * @return { ParamDTO } 
     */
    getDTO() {
        if (!this.value) return null
        let value = this.value?.value ?? this.value
        if (this.head) value = this.head + value
        if (this.subparam) value + ',' + this.subparam.value
        return value
    }
}

const defaultOutputArea = document.getElementById('output-span')
defaultOutputArea.addEventListener('click', e => {
    defaultOutputArea.innerText.copy()
})

/**
 * @param { OutputCommand } outputCommand 
 * @param { HTMLElement } outputArea
 */
const buildCommand = (outputCommand, outputArea) => {
    outputArea = outputArea ?? defaultOutputArea
    outputArea.command = outputCommand
    outputArea.innerHTML = ''

    const headSpan = document.createElement('span')
    headSpan.innerHTML = outputCommand.head
    headSpan.className = 'head-span'
    outputArea.appendChild(headSpan)

    if (!outputCommand.params) return

    outputCommand.params.forEach(param => {
        if (!param.value) return
        const span = document.createElement('span')
        let mainValue = param.value?.value ?? param.value
        let subValue = param?.subparam?.value
        span.innerHTML = ` ${param.head ?? ''}${mainValue}${subValue ? `,${subValue}` : ''}`
        span.title = param.name
        outputArea.appendChild(span)
    })
}

export { OutputCommandList, OutputCommand, OutputParam, buildCommand }

const commandExecBtn = document.getElementById('command-exec')
commandExecBtn.addEventListener('click', e => {
    execCommand([defaultOutputArea.command.getDTO()])
})