/**
* @typedef {import('./command-builder.js').CommandVO} CommandVO
* @typedef {import('./command-builder.js').ParamVO} ParamVO
*/

const menu = new CommandMenu('menu-list')
/** @type { HTMLButtonElement } */
const pushButton = document.getElementById('push-command')
pushButton.addEventListener('click', e => {
    menu.pushCommand(pushButton.command)
})

class CommandMenu {
    /** @param { string } id */
    constructor(id) {
        this.element = document.getElementById(id)
        if (!this.element) throw new Error()
        /** @type { Map<CommandVO, HTMLDivElement> } @const @private */
        this._commandMap = new Map()
    }

    /** @param { CommandVO } command */
    pushCommand(command) {
        const commandDiv = document.createElement('div')
        this._commandMap.set(command, commandDiv)

        commandDiv.className = 'card'
        
    }

    removeCommand(command) {
        const commandDiv = this._commandMap.get(command)
        commandDiv.remove()
        this._commandMap.delete(command)
    }

}