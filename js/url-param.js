import { commandVersionSelectElement, initCommand } from "./command-loader.js"
import { menu } from "./command-menu.js"
import { config } from "./init.js"
import { initLang, langData } from "./lang-loader.js"
import { server, setServer } from "./remote-execute.js"
import { showMessage } from "./ui.js"

export const urlParams = new URL(location.href).searchParams
urlParams.forEach((value, key) => {
    switch (key) {
        case 'server':
            setServer(decodeURIComponent(value))
            break
        case 'import':
            fetch(decodeURIComponent(value))
                .then(raw => menu.importCommand(raw))
                .catch(e => showMessage(langData.commandImportFail, 3000))
            break
        case 'lang':
            initLang(value)
            initCommand(config.commandVersion)
            break
        case 'version':
            if (value !== '1.2.1' && value !== '1.4.2') break
            commandVersionSelectElement.value = value
            initCommand(value)
    }
})