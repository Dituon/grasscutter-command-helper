import { Icon, SideBar } from "./ui.js"

const iconObj = new Icon('setting-icon')
const bar = new SideBar('setting-bar')
bar.bindIcon(iconObj)
iconObj.show()

// iconObj.onShow(()=>{console.log('show')})
// iconObj.onClose(()=>{console.log('close')})