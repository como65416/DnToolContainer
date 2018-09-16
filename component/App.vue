<template>
  <div>
    <el-container style="height:100%;">
      <el-aside width="240px">
        <el-menu default-active="2"
          class="el-menu-vertical-demo"
          style="height: 100%;"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#fff">
          <el-submenu v-for="(menu_config, index) in menu_configs" v-bind:index="menu_config.id" :key="menu_config.id">
            <template slot="title">
              <img v-bind:src="menu_config.icon_uri" style="height:25px;" />
              <span slot="title">{{ menu_config.groupName }}</span>
            </template>
            <el-menu-item
              v-for="(option, index2) in menu_config.options"
              v-bind:index="option.id"
              v-on:click="clickOption(option)"
              :key="option.id">
              {{ option.name }}
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>

      <el-main>
        <el-tabs
          type="border-card"
          style="height: 94%;"
          @tab-remove="closeTab"
          v-model="activity_tab_id">
          <el-tab-pane closable
            v-for="tab in tabs"
            :key="tab.id"
            :name="tab.id">
            <span slot="label" class="success">{{ tab.name }}</span>
            <iframe v-bind:src="tab.uri" style="width:100%;height:89%;border:none;"></iframe>
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
</style>

<script>
const fs = require('fs');
import ConfigManager from '../lib/ConfigManager';

let configs = ConfigManager.getMenuConfig();

export default {
  data() {
    return {
      menu_configs: configs,
      tabs: [],
      next_tab_id: 100,
      activity_tab_id: null
    };
  },
  methods: {
    clickOption: function (option) {
      for (let i in this.tabs) {
        if (this.tabs[i].option_id == option.id) {
          this.activity_tab_id = this.tabs[i].id
          return;
        }
      }

      let new_tab = {
        id: 'tab' + this.next_tab_id,
        name: option.name,
        uri: option.uri,
        option_id: option.id
      };
      this.tabs.push(new_tab);
      this.activity_tab_id = 'tab' + this.next_tab_id;
      this.next_tab_id++;
    },
    closeTab: function (tab_id) {
      for (let i in this.tabs) {
        if (this.tabs[i].id == tab_id) {
          this.tabs.splice(i, 1);
          if (this.tabs[i] !== undefined) {
            this.activity_tab_id = this.tabs[i].id;
          } else if (this.tabs.length != 0) {
            this.activity_tab_id = this.tabs[this.tabs.length - 1].id;
          }
          break;
        }
      }
    }
  }
}
</script>