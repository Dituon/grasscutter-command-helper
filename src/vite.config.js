import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    build: {
        manifest: true,
        outDir: '../'
    },
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'inline',
            manifest: {
                short_name: "Command Helper",
                name: "Grasscutter Command Helper",
                icons: [
                    {
                        src: "/icon/android-chrome-192x192.png",
                        sizes: "192x192",
                        type: "image/png"
                    },
                    {
                        src: "/icon/android-chrome-512x512.png",
                        sizes: "512x512",
                        type: "image/png"
                    }
                ],
                start_url: "/",
                display: "standalone",
                theme_color: "#1677ff",
                background_color: "#eeeeee"
            }
        })
    ]
})