/**
 * @typedef {import('./command-builder.js').CommandVO} CommandVO
 * @typedef {import('./command-builder.js').ParamVO} ParamVO
 * @typedef {import('./command-parser.js').SerialisedCommandCollection} SerialisedCommandCollection
 * @typedef {import('./command-parser.js').CommandDTO} CommandDTO
 * @typedef {import('./command-parser.js').CommandGroupDTO} CommandGroupDTO
 */

import { getCommandByIdAsync } from './command-loader.js'
import { CommandGroup } from './command-parser.js'
import { localCommandGroupList } from './init.js'
import { langData } from './lang-loader.js'
import { execCommand } from './remote-execute.js'
import { Icon, showMessage, SideBar } from "./ui.js"

class CommandMenu {
    /** @param { string } id */
    constructor(id) {
        this.element = document.getElementById(id)
        if (!this.element) throw new Error()
        this.list = localCommandGroupList
        this.list.forEach(commandGroup => this.#appendCommandGroup(commandGroup))
        /** @type { Set<CommandGroupDTO> } */
        this.chosenCommandGroupSet = new Set()
    }

    /**
     * @param { CommandGroupDTO } commandGroup
     */
    push(commandGroup) {
        if (!commandGroup.list?.length) return
        this.list.push(commandGroup)
        this.#appendCommandGroup(commandGroup)
    }

    /**
     * @param { CommandGroupDTO } commandGroup
     */
    delete(commandGroup) {
        this.list.splice(this.list.indexOf(commandGroup), 1)
        commandGroup.dom.remove()
    }

    /**
     * @param { CommandGroupDTO } commandGroup
     */
    #appendCommandGroup(commandGroup) {
        console.log(commandGroup)
        const details = document.createElement('details')
        commandGroup.dom = details
        const summary = document.createElement('summary')

        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        summary.appendChild(checkbox)
        checkbox.addEventListener('click', e => {
            e.target.checked ?
                this.chosenCommandGroupSet.add(commandGroup)
                : this.chosenCommandGroupSet.delete(commandGroup)
        })

        const groupName = document.createElement('span')
        groupName.innerText = commandGroup.title || langData.commandUnmaned
        summary.appendChild(groupName)

        details.appendChild(summary)

        if (commandGroup.description) {
            const description = document.createElement('div')
            description.className = 'command-group-description'
            description.innerText = commandGroup.description
            details.appendChild(description)
        }

        commandGroup.list.forEach(commandDTO => {
            const commandElement = document.createElement('div')
            commandElement.renderCommandDTO(commandDTO)
            details.appendChild(commandElement)
        })

        const deleteButton = document.createElement('div')
        deleteButton.classList.add("button-group-item")
        deleteButton.innerHTML = '🚮'
        deleteButton.addEventListener('click', e => {
            this.delete(commandGroup)
        })
        summary.appendChild(deleteButton)
        const savedGroup = document.getElementById('saved-command-group')
        savedGroup.appendChild(details)
    }

    execChosenCommand() {
        if (!this.chosenCommandGroupSet.size) {
            showMessage(langData.commandNotChoose, 3000)
            return
        }
        /** @type { CommandDTO[] } */
        const list = [...this.chosenCommandGroupSet].reduce((list, group) => {
            list.push(...group.list)
            return list
        }, [])
        execCommand(list)
    }

    /** @return { string } */
    exportChosenCommand() {
        if (!this.chosenCommandGroupSet.size) {
            showMessage(langData.commandNotChoose, 3000)
            return
        }
        const list = [...this.chosenCommandGroupSet]
            .map(groupDTO => CommandGroup.formDTO(groupDTO).toBase64())

        return `gmh://${list.join('&')}!`
    }

    copyChosenCommand() {
        if (!this.chosenCommandGroupSet.size) {
            showMessage(langData.commandNotChoose, 3000)
            return
        }
        [...this.chosenCommandGroupSet]
            .map(groupDTO => CommandGroup.formDTO(groupDTO).buildCommand())
            .join('\n').copy()
    }

    async importCommand() {
        const text = await navigator.clipboard.readText()
        const base64List = []
        const regex = /(?<=gmh:\/\/).*(?=!)/gm
        let m
        while ((m = regex.exec(text)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++
            }
            m.forEach((match, groupIndex) => {
                base64List.push(...match.split('&'))
            })
        }
        if (!base64List.length) {
            showMessage(langData.commandImportFail)
            return
        }
        const that = this
        base64List.forEach(base64 => {
            that.push(CommandGroup.fromBase64(base64).getDTO())
        })
        showMessage(langData.commandImportSuccess)
    }
}

const menu = new CommandMenu('menu-list')
export { CommandMenu, menu }

const appElement = document.getElementById('app')

let hide = true
const showMenuBtn = document.getElementById('menu-hide')
showMenuBtn.addEventListener('click', e => {
    showMenuBtn.className = hide ? 'menu-icon-show' : 'menu-icon-hide'
    showMenuBtn.innerHTML = hide ? '👈' : '🤏'
    appElement.className = hide ? '' : 'hide'
    hide = !hide
})

const menuIcon = new Icon('menu-icon')
const bar = new SideBar('menu-list')
bar.bindIcon(menuIcon)
menuIcon.show()

menuIcon.onClick(e => {
    appElement.className = hide ? '' : 'hide'
    hide = !hide
})

const menuShareBtn = document.getElementById('menu-share')
menuShareBtn.addEventListener('click', () => {
    let str = menu.exportChosenCommand()
    if (str) str.copy()
})

const menuCopyBtn = document.getElementById('menu-copy')
menuCopyBtn.addEventListener('click', () => menu.copyChosenCommand())

const menuImportBtn = document.getElementById('menu-import')
menuImportBtn.addEventListener('click', () => menu.importCommand())