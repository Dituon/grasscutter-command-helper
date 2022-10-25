import { Icon } from "./ui.js"

const iconObj = new Icon('setting-icon')

iconObj.show()

iconObj.onShow(()=>{console.log('show')})
iconObj.onClose(()=>{console.log('close')})