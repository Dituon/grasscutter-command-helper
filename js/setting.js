import { Icon, SideBar } from "./ui.js"
import { config } from "./init.js"

const settingIcon = new Icon('setting-icon')
const settingBar = new SideBar('setting-bar')
settingBar.bindIcon(settingIcon)
settingIcon.show()

export { settingBar }

export const authorInputElement = document.getElementById('export-author')
authorInputElement.addEventListener('change', e => {
    config.author = e.target.value
})