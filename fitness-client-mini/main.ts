import { createSSRApp } from 'vue';
import * as Pinia from 'pinia';
import 'uno.css';
import App from './App.vue';

export function createApp() {
  const app = createSSRApp(App);
  
  // 注册 Pinia
  const store = Pinia.createPinia();
  app.use(store);
  
  return {
    app,
    Pinia
  };
}