import { menu } from "../command/command-menu.js"
import { CommandGroup } from "../command/command-parser.js"
import { Icon, showMessage, SideBar } from "../ui/ui.js"
import { server, execCommand } from "../remote/remote-execute.js"
import { langData } from "../app/lang-loader.js"

import './worktop.css'

/**
 * @typedef {import('../command/command-parser.js').CommandDTO} CommandDTO
 * @typedef {import('../command/command-menu.js').CommandGroup} CommandGroup
 */


const commandList = document.getElementById('worktop-command-list')

class Worktop {
    constructor(id) {
        this.element = document.getElementById(id)
        if (!this.element) throw new Error()
        this.list = new CommandGroup()
    }

    /** @param { CommandDTO } commandDTO */
    pushCommand(commandDTO) {
        this.list.push(commandDTO)

        const div = document.createElement('div')
        div.className = 'card'
        const deleteButton = document.createElement('div')
        deleteButton.classList.add("button-group-item")
        deleteButton.innerHTML = '❌'
        deleteButton.addEventListener('click', e => {
            e.stopPropagation()
            this.list.delete(commandDTO)
            div.remove()
        })
        div.appendChild(deleteButton)
        div.renderCommandDTO(commandDTO)
        div.command = commandDTO
        commandList.appendChild(div)
    }

    save() {
        menu.push({
            head: {
                title: document.getElementById('worktop-title').value,
                description: document.getElementById('worktop-description').value
            },
            list: this.list.getList()
        })
        showMessage(langData.saveSuccess)
    }

    execute() {
        console.log(this.list.getList())
        execCommand(this.list.getList())
    }

    /** @return { string } */
    export() {
        if (!this.list.set.size) {
            showMessage(langData.commandNotChoose, 3000)
            return
        }
        return `gmh://${this.list.toBase64()}!`
    }
}

const iconObj = new Icon('worktop-icon')
const bar = new SideBar('worktop-bar')
bar.bindIcon(iconObj)
iconObj.show()

const worktop = new Worktop('worktop-bar')
const outputArea = document.getElementById('output-span')
const pushButton = document.getElementById('command-push')
pushButton.addEventListener('click', e => {
    /** @type { CommandDTO } */
    const commandDTO = outputArea.command.getDTO()
    worktop.pushCommand(commandDTO)
    showMessage(langData.commandPushed)
})

const saveButton = document.getElementById('worktop-save')
saveButton.addEventListener('click', e => worktop.save())

const executeButton = document.getElementById('worktop-execute')
executeButton.addEventListener('click', e => worktop.execute())

const worktopCopyBtn = document.getElementById('worktop-copy')
worktopCopyBtn.addEventListener('click', e => {
    worktop.list.copyCommand()
})