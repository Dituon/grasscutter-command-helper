const ADS_HTML = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6954577391022234"
crossorigin="anonymous"></script>`
const localStorageKey = 'showAdsTime'
const probability = 0.1

;(function showAds (show = true) {
     const date = new Date().getDate()

     if (!show && localStorage.getItem(localStorageKey) === date.toString()) return

     localStorage.setItem(localStorageKey, date.toString())
     document.head.innerHTML += ADS_HTML
})(Math.random() <= probability)