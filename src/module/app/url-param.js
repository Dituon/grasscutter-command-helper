import { commandVersionSelectElement, initCommand } from "../command/command-loader.js"
import { menu } from "../command/command-menu.js"
import { config, importedList } from "./init.js"
import { initLang, langData } from "./lang-loader.js"
import { setServer } from "../remote/remote-execute.js"
import { showMessage } from "../ui/ui.js"

export const urlParams = new URL(location.href).searchParams

export function loadUrlParam(){
    urlParams.forEach((value, key) => {
        switch (key) {
            case 'server':
                setServer(decodeURIComponent(value))
                break
            case 'import':
                if (parseInt(value)) value = `${window.location.origin}/share/${value}.gmh`
                console.debug(value)
                if (importedList.includes(value)) break
                fetch(decodeURIComponent(value)).then(p => p.text())
                    .then(raw => menu.importCommand(raw))
                    .catch(e => showMessage(langData.commandImportFail, 3000))
                    .finally(() => importedList.push(value))
                break
            case 'lang':
                initLang(value)
                initCommand(config.commandVersion)
                break
            case 'version':
                if (!['1.2.1', '1.4.2', '1.6.1', 'GM'].includes(value)) break
                commandVersionSelectElement.value = value
                initCommand(value)
                break
        }
    })
}