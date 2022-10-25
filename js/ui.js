/** @typedef {import('./command-builder').ParamValue} ParamValue */

/**
 * @param {string} value 
 * @param {number} [time=1000]
 */
const showMessage = (value, time = 1000) => {
    const message = document.getElementById("message")
    if (message) message.remove()

    var div = document.createElement('div')
    div.id = 'message'
    div.innerText = value
    document.body.appendChild(div)
    setTimeout(() => {
        div.style.top = '0px'
    }, 1)
    setTimeout(() => {
        div.style.top = ''
    }, time)
}

export { showMessage }


const commandListElement = document.getElementById('command-list')

commandListElement.addEventListener('click', e => {
    document.getElementById('choose').style.display = 'block'
    document.getElementById('output').style.display = 'flex'
    commandListElement.style.height = '50vh'
    commandListElement.style.fontSize = '0.8rem'
    commandListElement.style.maxWidth = '50vh'
}, { once: true })

const mask = new class {
    constructor() {
        this.element = document.getElementById('mask')
        this.showing = false
    }

    /**
     * @param {Function} callback 
     */
    onclick(callback) {
        this.callback = callback
        this.element.addEventListener('click', e => {
            if (this.timer) return
            callback(e)
        })
        return this
    }

    show() {
        if (this.timer) {
            clearTimeout(this.timer)
            this.timer = null
        }
        this.element.style.pointerEvents = 'auto'
        this.element.style.display = 'block'
        setTimeout(() => this.element.style.opacity = '0.5', 10)
    }

    hide() {
        this.element.removeEventListener('click', this.callbacks)
        this.element.style.opacity = '0'
        this.element.style.pointerEvents = 'none'
        this.timer = setTimeout(() => this.element.style.display = 'none', 1000)
    }

    togger() {
        this.showing ? this.hide() : this.show()
    }
}

export { mask }

/**
 * @param {string} head 
 * @param {string} label 
 */
HTMLElement.prototype.appendCommand = function (head, label) {
    const headElement = document.createElement('span')
    headElement.className = 'command-head'
    headElement.innerHTML = head

    const spanElement = document.createElement('span')
    spanElement.className = 'modal-select-item'
    spanElement.innerHTML = label

    this.appendChild(headElement)
    this.appendChild(spanElement)
}

HTMLElement.prototype.injectCommand = function (head, label) {
    this.innerHTML = ''
    this.appendCommand(head, label)
}