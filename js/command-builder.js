/**
 * @typedef { object } CommandDTO
 * @property { string } id 指令唯一标识符
 * @property { string } head 指令头
 * @property { string } label 描述
 * @property { ParamDTO[] } [params]
 */


/**
 * @typedef { object } ParamDTO
 * @property { string } type
 * @property { string } name
 * @property { boolean } required
 * @property { ParamValue | string | number } [value]
 * @property { ParamValue } [_value]
 * @property { ParamDTO } [subparam]
 * @property { number } [min]
 * @property { number } [max]
 * @property { HTMLElement } inputElement
 */

/**
 * @typedef { object } ParamValue
 * @property { string } label
 * @property { string } value
 */

class OutputCommandList {
    /** @param { CommandDTO[] } commandList */
    constructor(commandList) {
        this.list = commandList.map(command => new OutputCommand(command))
    }

    /**
     * 通过 `head` 或 `label` 过滤 `command`, 返回新数组
     * @param { string } text 
     * @returns { CommandDTO[] }
     */
    filter(text) {
        return this.list.filter(command => {
            return command.head.includes(text) || command.label.includes(text)
        })
    }
}

/**
 * 实现 {@link CommandDTO} 数据接口
 * 
 * 构建 {@link OutputParam} 
 */
class OutputCommand {
    /** @param { CommandDTO } commandDTO */
    constructor(commandDTO) {
        Object.assign(this, commandDTO)
        if (!this.params) return
        this.params = commandDTO.params.map(param => new OutputParam(param, this))
    }

    build() { buildCommand(this) }
}

/**
 * 实现 {@link ParamDTO} 数据接口
 * 
 * 需指定 Parent{@link CommandDTO}
 * 
 * 代理 `.value`, 与输出DOM绑定
 */
class OutputParam {
    /** 
     * @param { ParamDTO } paramDTO 
     * @param { OutputCommand } parentCommand
     */
    constructor(paramDTO, parentCommand) {
        Object.assign(this, paramDTO)
        this.parent = parentCommand
        this.isModalSelect = !['number', 'text', 'select'].includes(this.type)
        if (this.subparam) {
            this.subparam.isSub = true
            this.subparam = new OutputParam(this.subparam)
        }

        const that = this
        this.value = paramDTO.value
        Object.defineProperty(this, 'value', {
            get() {
                return paramDTO.value
            },
            /** @param { ParamValue } target */
            set(target) {
                paramDTO.value = target
                buildCommand(that.parent)
                if (!this.inputElement) return
                that.isModalSelect ? this.inputElement.injectCommand(
                    target.value, target.label
                ) : this.inputElement.value = target
            }
        })
    }

    build() { 
        this.value = this.value
     }
}

/**
 * @param { CommandDTO } outputCommand 
 */
const buildCommand = outputCommand => {
    const outputArea = document.getElementById('output-span')
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