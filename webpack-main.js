import Vue from 'vue'
import App from './src/App.vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import Store from './src/store/Store.js';
import Vuex from 'vuex';

Vue.use(ElementUI);
Vue.use(Vuex);

new Vue({
  el: '#app',
  store: Store.createStore(),
  render: h => h(App)
});