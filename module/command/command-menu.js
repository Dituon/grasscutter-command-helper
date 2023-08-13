/**
 * @typedef {import('./command-builder.js').CommandVO} CommandVO
 * @typedef {import('./command-builder.js').ParamVO} ParamVO
 * @typedef {import('./command-parser.js').SerialisedCommandCollection} SerialisedCommandCollection
 * @typedef {import('./command-parser.js').CommandDTO} CommandDTO
 * @typedef {import('./command-parser.js').CommandGroupDTO} CommandGroupDTO
 */

import {CommandGroup} from './command-parser.js'
import {localCommandGroupList} from '../app/init.js'
import {langData} from '../app/lang-loader.js'
import {execCommand} from '../remote/remote-execute.js'
import {ShareModal} from '../share/share-modal.js'
import {Icon, showMessage, SideBar} from "../ui/ui.js"

import './menu.css'

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
        groupName.innerText = commandGroup?.head?.title || langData.commandUnmaned
        summary.appendChild(groupName)

        details.appendChild(summary)

        if (commandGroup?.head?.description) {
            const description = document.createElement('div')
            description.className = 'command-group-description'
            description.innerText = commandGroup.head.description
            details.appendChild(description)
        }

        commandGroup.list.forEach(commandDTO => {
            const commandElement = document.createElement('div')
            commandElement.renderCommandDTO(commandDTO)
            details.appendChild(commandElement)
        })

        const deleteButton = document.createElement('div')
        deleteButton.classList.add("button-group-item")
        deleteButton.innerHTML = '❌'
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
        console.log(this.chosenCommandGroupSet)
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

    async importCommandFromClipboard() {
        this.importCommand(await navigator.clipboard.readText())
            .catch(e => showMessage(langData.commandImportFail))
    }

    /** @param { string } raw base64 */
    importCommand(raw) {
        const base64List = []
        const regex = /(?<=gmh:\/\/).*(?=!)/gm
        let m
        while ((m = regex.exec(raw)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++
            }
            m.forEach((match, groupIndex) => {
                base64List.push(...match.split('&'))
            })
        }
        if (!base64List.length) throw new Error()
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
const shareModal = new ShareModal(menu)
menuShareBtn.addEventListener('click', () => shareModal.show())

const menuCopyBtn = document.getElementById('menu-copy')
menuCopyBtn.addEventListener('click', () => menu.copyChosenCommand())

const menuExecBtn = document.getElementById('menu-execute')
menuExecBtn.addEventListener('click', () => menu.execChosenCommand())