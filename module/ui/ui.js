/** @typedef {import('../command/command-builder.js').ParamValue} ParamValue */

import './init.css'
import './nav-icon.css'
import './side-bar.css'

/**
 * @param {string} value 
 * @param {number} [time=1000]
 */
const showMessage = (value, time = 1000) => {
    const message = document.getElementById('message')
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

export const mask = new class {
    /** @type { HTMLElement } */
    element
    /** @type { boolean } */
    showing
    timer

    constructor() {
        this.element = document.getElementById('mask')
        this.showing = false
    }

    /**
     * @param {Function} callback 
     */
    set onclick(callback){
        this.element.addEventListener('click', e => {
            callback(e)
        })
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

HTMLElement.prototype.appendTag = function (...tags) {
    if (!tags?.length) return
    const that = this
    tags.forEach(tag => {
        tag && that.appendPreTag(tag)
    })
}

/** 
 * @param {string} tag 
 * @param {Function} [listener]
 */
HTMLElement.prototype.appendPreTag = function (tag, listener) {
    const headElement = document.createElement('span')
    headElement.className = 'command-head'
    headElement.innerHTML = tag
    this.appendChild(headElement)
    if (listener) headElement.addEventListener('click', listener)
}

class Icon {
    /** 
     * @param { string } id 
     * @param { {switchable: [true]} params }
     */
    constructor(id, params = { switchable: true }) {
        this.element = document.getElementById(id)
        if (!this.element) throw new Error()
        if (params?.switchable === false) {
            this.clicked = true
            return
        }

        this.iconEmoji = this.element.innerHTML
        this.element.innerHTML = `<span class="front">${this.iconEmoji}</span><span class="behind">❌</span>`
        this.clicked = false
        this.element.addEventListener('click', e => {
            this.element.style.transform = this.clicked ? '' : 'rotateY(180deg)'
            this.clicked = !this.clicked
        })
    }

    show() {
        this.element.className = 'show'
    }

    hide() {
        this.element.className = ''
    }

    front() {
        this.element.style.transform = ''
        this.clicked = false
    }

    behind() {
        this.element.style.transform = 'rotateY(180deg)'
        this.clicked = true
    }

    /** @param { Function } callback */
    onShow(callback) {
        callback && this.element.addEventListener('click', e => {
            this.clicked && callback(e)
        })
    }

    /** @param { Function } callback */
    onClose(callback) {
        callback && this.element.addEventListener('click', e => {
            !this.clicked && callback(e)
        })
    }

    /** @param { Function } callback */
    onClick(callback) {
        callback && this.element.addEventListener('click', e => callback(e))
    }
}

export { Icon }

class SideBar {
    /** @param { string } id */
    constructor(id) {
        this.element = document.getElementById(id)
        if (!this.element) throw new Error()
    }

    /** @param { Icon } icon */
    bindIcon(icon) {
        this.icon = icon
        icon.onShow(() => this.show())
        icon.onClose(() => this.hide())
    }

    show() {
        this.element.style.right = '0'
        if (this.icon) this.icon.behind()
    }

    hide() {
        this.element.style.right = ''
        if (this.icon) this.icon.front()
    }
}

export { SideBar }