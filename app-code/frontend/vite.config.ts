import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: "./",
  build: {
    outDir: "../backend/static",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
        output: {
            manualChunks: id => {
                if (id.includes("@fluentui/react-icons")) {
                    return "fluentui-icons";
                } else if (id.includes("@fluentui/react")) {
                    return "fluentui-react";
                } else if (id.includes("node_modules")) {
                    return "vendor";
                }
            }
        }
    }
},
server: {
    proxy: {
        "/ask": "http://127.0.0.1:5000",
        "/chat": "http://127.0.0.1:5000",
        "/summary": "http://127.0.0.1:5000"
    }
}
})
