import { menu } from "./command-menu.js"
import { CommandGroup } from "./command-parser.js"
import { Icon, SideBar } from "./ui.js"
import { server, execCommand } from "./remote-execute.js"
import { getCommandById } from "./command-loader.js"

/**
 * @typedef {import('./command-parser.js').CommandDTO} CommandDTO
 * @typedef {import('./command-menu.js').CommandGroup} CommandGroup
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
        deleteButton.innerHTML = '🚮'
        deleteButton.addEventListener('click', e => {
            e.stopPropagation()
            this.list.delete(commandDTO)
            div.remove()
        })
        div.appendChild(deleteButton)
        const commandVO = getCommandById(commandDTO.id)
        div.appendCommand(commandVO.head, commandVO.label)
        div.command = commandDTO
        commandList.appendChild(div)
    }

    save() {
        menu.push({
            title: document.getElementById('worktop-title').value,
            description: document.getElementById('worktop-description').value,
            list: this.list.getList()
        })
    }

    execute() {
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
})

const saveButton = document.getElementById('worktop-save')
saveButton.addEventListener('click', e => worktop.save())

const executeButton = document.getElementById('worktop-execute')
executeButton.addEventListener('click', e => worktop.execute())

const worktopCopyBtn = document.getElementById('worktop-copy')
worktopCopyBtn.addEventListener('click', e => {
    worktop.list.copyCommand()
})

const worktopShareBtn = document.getElementById('worktop-share')
worktopShareBtn.addEventListener('click', e => {
    console.log(worktop.export())
})