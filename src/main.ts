import { createApp } from 'vue'
import App from './App.vue'

// 自动注销同一域名/端口下其他项目可能残留的 Legacy Service Worker，防止拦截污染和报错
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (const registration of registrations) {
      registration.unregister().then(success => {
        if (success) {
          console.log('🧹 已成功清理域名下的历史残留 Service Worker');
        }
      });
    }
  });
}

createApp(App).mount('#app')
