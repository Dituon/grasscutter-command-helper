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
import { Icon, SideBar } from "./ui.js"

const chosenCommandGroupSet = new Set()

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

        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        summary.appendChild(checkbox)
        checkbox.addEventListener('click', e => {
            e.target.checked ?
                chosenCommandGroupSet.add(commandGroup)
                : chosenCommandGroupSet.delete(commandGroup)
        })

        const groupName = document.createElement('span')
        groupName.innerText = commandGroup.title
        summary.appendChild(groupName)

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

const appElement = document.getElementById('app')

let hide = true
const showMenuBtn = document.getElementById('menu-hide')
showMenuBtn.addEventListener('click', e => {
    showMenuBtn.className = hide ? 'menu-icon-show' : 'menu-icon-hide'
    showMenuBtn.innerHTML = hide ? '👈':'🤏'
    appElement.className = hide ? '' : 'hide'
    hide = !hide
})

const menuIcon = new Icon('menu-icon')
const bar = new SideBar('menu-list')
bar.bindIcon(menuIcon)
menuIcon.show()

menuIcon.onClick( e => {
    appElement.className = hide ? '' : 'hide'
    hide = !hide
})

