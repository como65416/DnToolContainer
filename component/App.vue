<template>
  <div>
    <el-container style="height:100%;">
      <sidebar
        v-bind:sidebar_config="menu_configs"
        v-on:option-clicked="optionClicked"
        v-show="sidebarVisible">
      </sidebar>
      <main-contain ref="main">
      </main-contain>
      <div>
        <el-button type="primary" icon="el-icon-arrow-left" size="mini" style="position: fixed; left: 10px; bottom: 40px;" @click="sidebarVisible = false" v-show="sidebarVisible" circle plain></el-button>
        <el-button type="primary" icon="el-icon-arrow-right" size="mini" style="position: fixed; left: 0px; bottom: 40px;" @click="sidebarVisible = true" v-show="!sidebarVisible" circle plain></el-button>
        <el-button type="primary" icon="el-icon-menu" size="mini" style="position: fixed;left: 0px;bottom: 8px;" @click="dialogTableVisible = true" circle plain></el-button>
      </div>
    </el-container>

    <el-dialog title="Preferences" width="900px" height="700px" top="40px" :visible.sync="dialogTableVisible">
      <setting v-on:packages-changed="reloadPackages"></setting>
    </el-dialog>
  </div>
</template>

<style scoped>
</style>

<script>
import ConfigManager from '../lib/ConfigManager';
import Sidebar from '../component/Sidebar.vue';
import MainContain from '../component/MainContain.vue';
import Setting from '../component/Setting.vue';

let configs = ConfigManager.getMenuConfig();

export default {
  data() {
    return {
      menu_configs: configs,
      dialogTableVisible: false,
      sidebarVisible: true
    };
  },
  methods: {
    optionClicked: function (option) {
      this.$refs.main.addTab(option);
    },
    reloadPackages: function () {
      this.menu_configs = ConfigManager.getMenuConfig();
    }
  },
  components: {
    'sidebar': Sidebar,
    'main-contain': MainContain,
    'setting': Setting
  }
}
</script>