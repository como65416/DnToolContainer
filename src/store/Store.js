import Vuex from 'vuex';
import PackageUtil from '../lib/PackageUtil';

let createStore = () => new Vuex.Store({
  state: {
    isDevToolsEnabled: false,
    installedPackages: []
  },
  mutations: {
    changeDevToolsEnableStatus (state, value) {
      state.isDevToolsEnabled = value;
    },
    reloadInstalledPackages (state) {
      state.installedPackages = PackageUtil.getInstalledPackages();
    }
  }
});

export default {
  createStore
}