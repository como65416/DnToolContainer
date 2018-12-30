import Vue from 'vue'
import App from './src/App.vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import Vuex from 'vuex'

Vue.use(ElementUI);
Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    isDevToolsEnabled: false
  },
  mutations: {
    changeDevToolsEnableStatus (state, value) {
      state.isDevToolsEnabled = value;
    }
  }
});

new Vue({
  el: '#app',
  store,
  render: h => h(App)
});