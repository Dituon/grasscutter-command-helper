import { Icon, SideBar } from "../ui/ui.js"
import { config } from "./init.js"

import './setting.css'

const settingIcon = new Icon('setting-icon')
export const settingBar = new SideBar('setting-bar')
settingBar.bindIcon(settingIcon)
settingIcon.show()

export const authorInputElement = document.getElementById('export-author')
authorInputElement.addEventListener('change', e => {
    config.author = e.target.value
})

const clearCacheBtn = document.getElementById('clear-cache')
clearCacheBtn.addEventListener('click', e => {
    localStorage.clear()
    location.reload()
})