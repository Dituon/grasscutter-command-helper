let hide = false
document.getElementById('menu-hide').addEventListener('click', e => {
    document.getElementById('app').className = hide ? '' : 'hide'
    hide = !hide
})