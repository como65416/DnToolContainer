import Vuex from 'vuex';

let createStore = () => new Vuex.Store({
  state: {
    isDevToolsEnabled: false
  },
  mutations: {
    changeDevToolsEnableStatus (state, value) {
      state.isDevToolsEnabled = value;
    }
  }
});

export default {
  createStore
}