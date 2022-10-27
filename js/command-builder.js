import { config } from "./init.js"

/**
 * @typedef { object } CommandVO
 * @property { '1.2.1' | '1.4.2' } version
 * @property { string } id
 * @property { string } head
 * @property { string } label
 * @property { ParamVO[] } [params]
 */

/**
 * @typedef { object } ParamVO
 * @property { string } type
 * @property { string } name
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
        this.list = commandList.map(command => new OutputCommand(command))
    }

    /**
     * 通过 `head` 或 `label` 过滤 `command`, 返回新数组
     * @param { string } text 
     * @returns { CommandVO[] }
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
        let newObj = {}
        Object.assign(newObj, this)
        newObj.params = this.params.map(param => param.getDTO())
        return newObj
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
 * @property { HTMLElement } inputElement
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
            this.subparam = new OutputParam(this.subparam)
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
                if (!this.inputElement) return
                that.isModalSelect ? this.inputElement.injectCommand(
                    target.value, target.label
                ) : this.inputElement.value = target
            }
        })
    }

    build() { this.value = this.value }

    /** 
     * 导出原始数据, 返回新对象
     * 
     * @return { ParamDTO } 
     */
    getDTO() {
        const newObj = {
            type: this.type,
            name: this.name,
            head: this.head,
            required: this.required,
            value: this.value
        }

        let sub = this?.subparam
        if (sub) newObj.subparam = {
            type: sub?.type,
            name: sub?.name,
            required: sub?.required,
            value: sub?.value
        }

        return newObj
    }
}

/**
 * @param { OutputCommand } outputCommand 
 * @param { HTMLElement } outputArea
 */
const buildCommand = (outputCommand, outputArea) => {
    outputArea = outputArea ?? document.getElementById('output-span')
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
        span.innerHTML = ` ${param.head ?? ''}${mainValue}${subValue ?? ''}`
        span.title = param.name
        outputArea.appendChild(span)
    })
}

export { OutputCommandList, OutputCommand, OutputParam, buildCommand }