import { toBase64, fromBase64 } from '../lib/base64.js'
import { OutputCommand } from './command-builder.js'
import { getCommandByIdAsync } from './command-loader.js'
import { config } from './init.js'
import { langData } from './lang-loader.js'
import { getModalById } from './modal-loader.js'
import { showMessage } from './ui.js'

/**
 * @typedef {import('./command-builder.js').CommandVO} CommandVO
 * @typedef {import('./command-builder.js').ParamVO} ParamVO
 * @typedef {import('./command-builder.js').OutputCommand} OutputCommand
 * @typedef {import('./command-builder.js').OutputParam} OutputParam
 */

/**
 * @typedef { object } CommandDTO
 * @property { string } id
 * @property { ParamDTO[] } [params]
 */

/**
 * @typedef { number | string | null } ParamDTO
 */

/**
 * @typedef { object } CommandGroupDTO
 * @property { string? } title
 * @property { string? } description
 * @property { string? } author
 * @property { CommandDTO[] } list
 */

export class CommandGroup {
    /**
     * @param { CommandDTO[] } [commandDTOList=[]]
     * @param { {title?: string, description?: string, author?: string} } [head]
     */
    constructor(commandDTOList = [], head = {}) {
        this.set = new Set(commandDTOList)
        this.head = head
        head.author = head?.author ?? config.author
    }

    /** @param {CommandDTO} commandDTO */
    push(commandDTO) {
        this.set.add(commandDTO)
    }

    /** @param {CommandDTO} commandDTO */
    delete(commandDTO) {
        this.set.delete(commandDTO)
    }

    /** @return { CommandDTO[] } */
    getList() {
        return [...this.set]
    }

    /** @return { string } */
    buildCommand() {
        return this.getList().reduce((str, commandDTO) => {
            return str += OutputCommand.stringify(commandDTO) + '\n'
        }, '')
    }

    copyCommand() {
        this.buildCommand().copy()
    }

    /** @return { string } */
    toBase64() {
        return toBase64(JSON.stringify(this.getDTO()))
    }

    /** @return { CommandGroupDTO } */
    getDTO() {
        return {
            head: this.head,
            list: this.getList()
        }
    }

    /** @param { string } base64 */
    static fromBase64(base64) {
        try {
            const obj = JSON.parse(fromBase64(base64))
            if (!obj?.list?.length) throw new Error()
            return new CommandGroup(obj.list, obj.head)
        } catch (e) {
            showMessage(langData.commandImportFail)
            console.error(e)
            console.warn({
                raw: base64,
                fromBase64: fromBase64(base64)
            })
            return null
        }
    }

    /** @param { CommandGroupDTO } commandGroupDTO */
    static formDTO(commandGroupDTO) {
        return new CommandGroup(commandGroupDTO.list, commandGroupDTO.head)
    }
}

/** @param { CommandDTO } commandDTO */
HTMLDivElement.prototype.renderCommandDTO = function (commandDTO) {
    getCommandByIdAsync(commandDTO.id).then(commandVO => {
        this.appendCommand(commandVO.head, commandVO.name ?? commandVO.label)
        if (!commandDTO.params?.length) return

        for (let i = 0; i < commandDTO.params.length; i++) {
            const paramDTO = commandDTO.params[i]
            if (!paramDTO) continue

            const paramVO = commandVO.params[i]
            switch (paramVO.type) {
                case 'number':
                case 'string':
                case 'select':
                    this.appendTag(`${paramVO.symbol ?? ''}${paramDTO}`)
                    break
                default:
                    const that = this
                    getModalById(paramDTO, paramVO.type).then(modalDTO => {
                        if (modalDTO.icon) {
                            const icon = document.createElement('img')
                            icon.className = 'icon'
                            icon.src = modalDTO.icon
                            that.appendChild(icon)
                        }
                        that.appendTag(`${paramVO.symbol ?? ''}${modalDTO.name}`)
                    })
                    break
            }
        }
    })
}