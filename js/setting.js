import { Icon, SideBar } from "./ui.js"

const settingIcon = new Icon('setting-icon')
const settingBar = new SideBar('setting-bar')
settingBar.bindIcon(settingIcon)
settingIcon.show()

export { settingBar }

// iconObj.onShow(()=>{console.log('show')})
// iconObj.onClose(()=>{console.log('close')})