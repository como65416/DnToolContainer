<template>
  <div>
    <el-container style="height:100%;">
      <sidebar
        v-bind:sidebar_config="menu_configs"
        v-on:option-clicked="optionClicked"
        v-show="sidebarVisible">
      </sidebar>
      <main-contain ref="main" :is_dev_tools_enabled="is_dev_tools_enabled">
      </main-contain>
      <div>
        <el-button type="primary" icon="el-icon-arrow-left" size="mini" style="position: fixed; left: 10px; bottom: 40px;" @click="sidebarVisible = false" v-show="sidebarVisible" circle plain></el-button>
        <el-button type="primary" icon="el-icon-arrow-right" size="mini" style="position: fixed; left: 0px; bottom: 40px;" @click="sidebarVisible = true" v-show="!sidebarVisible" circle plain></el-button>
        <el-button type="primary" icon="el-icon-menu" size="mini" style="position: fixed;left: 0px;bottom: 8px;" @click="dialogTableVisible = true" circle plain></el-button>
      </div>
    </el-container>

    <el-dialog title="Preferences" width="900px" height="700px" top="40px" :visible.sync="dialogTableVisible">
      <setting v-on:packages-changed="reloadPackages" :is_dev_tools_enabled.sync="is_dev_tools_enabled"></setting>
    </el-dialog>
  </div>
</template>

<style scoped>
</style>

<script>
import ConfigManager from './lib/ConfigManager';
import Sidebar from './component/Sidebar.vue';
import MainContain from './component/MainContain.vue';
import Setting from './component/Setting.vue';

let configs = ConfigManager.getSidebarMenuConfig();

export default {
  data() {
    return {
      menu_configs: configs,
      dialogTableVisible: false,
      sidebarVisible: true,
      is_dev_tools_enabled: true
    };
  },
  methods: {
    optionClicked: function (info) {
      this.$refs.main.addTab(info);
    },
    reloadPackages: function () {
      this.menu_configs = ConfigManager.getSidebarMenuConfig();
    }
  },
  components: {
    'sidebar': Sidebar,
    'main-contain': MainContain,
    'setting': Setting
  }
}
</script>