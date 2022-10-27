import { Icon, SideBar } from "./ui.js"

/**
 * @typedef {import('./command-builder.js').CommandVO} CommandDTO
 */


 const commandList = document.getElementById('worktop-command-list')

 class Worktop {
     constructor(id) {
         this.element = document.getElementById(id)
         if (!this.element) throw new Error()
     }
 
     /** @param { CommandDTO } commandDTO */
     pushCommand(commandDTO) {
         const div = document.createElement('div')
         div.className = 'card'
         div.appendCommand(commandDTO.head, commandDTO.label)
 
         commandList.appendChild(div)
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