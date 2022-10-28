/**
 * @typedef {import('./command-builder.js').CommandVO} CommandVO
 * @typedef {import('./command-builder.js').ParamVO} ParamVO
 * @typedef {import('./command-parser.js').SerialisedCommandCollection} SerialisedCommandCollection
 * @typedef {import('./command-parser.js').CommandDTO} CommandDTO
 */

/**
 * @typedef { object } CommandGroup
 * @property { string } title
 * @property { string } description
 * @property { CommandDTO[] } commandList
 */

import { getCommandById } from './command-loader.js'
import { localCommandGroupList } from './init.js'

class CommandMenu {
    /** @param { string } id */
    constructor(id) {
        this.element = document.getElementById(id)
        if (!this.element) throw new Error()
        this.list = localCommandGroupList
        this.list.forEach(commandGroup => this.#appendCommandGroup(commandGroup))
    }

    /**
     * @param { CommandGroup } commandGroup
     */
    push(commandGroup) {
        if (!commandGroup.commandList?.length) return
        this.list.push(commandGroup)
        this.#appendCommandGroup(commandGroup)
    }

    /**
     * @param { CommandGroup } commandGroup
     */
    delete(commandGroup) {
        this.list.splice(this.list.indexOf(commandGroup), 1)
        commandGroup.dom.remove()
    }

    /**
     * @param { CommandGroup } commandGroup
     */
    #appendCommandGroup(commandGroup) {
        const details = document.createElement('details')
        commandGroup.dom = details
        const summary = document.createElement('summary')
        summary.innerText = commandGroup.title
        details.appendChild(summary)

        if (commandGroup.description) {
            const description = document.createElement('div')
            description.className = 'command-group-description'
            description.innerText = commandGroup.description
            details.appendChild(description)
        }

        commandGroup.commandList.forEach(commandDTO => {
            const commandElement = document.createElement('div')
            getCommandById(commandDTO.id).then(commandVO => {
                commandElement.appendCommand(commandVO.head, commandVO.label)
            })
            details.appendChild(commandElement)
        })

        const deleteButton = document.createElement('button')
        deleteButton.innerHTML = 'x'
        deleteButton.addEventListener('click', e => {
            this.delete(commandGroup)
        })
        summary.appendChild(deleteButton)

        this.element.appendChild(details)
    }
}

const menu = new CommandMenu('menu-list')
export { CommandMenu, menu }

let hide = false
document.getElementById('menu-hide').addEventListener('click', e => {
    document.getElementById('app').className = hide ? '' : 'hide'
    hide = !hide
})