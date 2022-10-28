import { menu } from "./command-menu.js"
import { SerialisedCommandCollection } from "./command-parser.js"
import { Icon, SideBar } from "./ui.js"

/**
 * @typedef {import('./command-parser.js').CommandDTO} CommandDTO
 * @typedef {import('./command-menu.js').CommandGroup} CommandGroup
 */


const commandList = document.getElementById('worktop-command-list')

class Worktop {
    constructor(id) {
        this.element = document.getElementById(id)
        if (!this.element) throw new Error()
        this.collection = new SerialisedCommandCollection()
    }

    /** @param { CommandDTO } commandDTO */
    pushCommand(commandDTO) {
        this.collection.push(commandDTO)

        const div = document.createElement('div')
        div.className = 'card'
        const deleteButtom = document.createElement('button')
        deleteButtom.innerHTML = 'x'
        deleteButtom.addEventListener('click', e => {
            e.stopPropagation()
            this.collection.delete(commandDTO)
            div.remove()
        })
        div.appendChild(deleteButtom)
        div.appendCommand(commandDTO.head, commandDTO.label)
        div.command = commandDTO
        commandList.appendChild(div)
    }

    save() {
        menu.push({
            title: document.getElementById('worktop-title').value || 'unname',
            description: document.getElementById('worktop-description').value,
            commandList: this.collection.getList()
        })
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

const saveButtom = document.getElementById('worktop-save')
saveButtom.addEventListener('click', e => {
    worktop.save()
})