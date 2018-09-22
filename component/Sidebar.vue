<template>
  <el-aside width="240px">
    <el-menu default-active="2"
      class="el-menu-vertical-demo"
      style="height: 100%;"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#fff">
      <el-input
        placeholder="Search Tool"
        style="margin: 10px; width: 220px;"
        v-model="search_keyword">
        <i slot="prefix" class="el-input__icon el-icon-search"></i>
      </el-input>
      <el-submenu
        v-for="(menu_config, index) in menu_configs"
        v-bind:index="menu_config.id"
        v-show="menu_config.visable"
        :key="menu_config.id">
        <template slot="title">
          <img v-bind:src="menu_config.icon_uri" style="height:25px;" />
          <span slot="title">{{ menu_config.packageName }}</span>
        </template>
        <el-menu-item
          v-for="(option, index2) in menu_config.options"
          v-bind:index="option.id"
          v-on:click="clickOption(option)"
          v-show="option.visable"
          :key="option.id">
          {{ option.name }}
        </el-menu-item>
      </el-submenu>
    </el-menu>
  </el-aside>
</template>

<style scoped>
</style>

<script>
export default {
  props: ['sidebar_config'],
  data() {
    let menu_configs = this.sidebar_config;
    for (let i in menu_configs) {
      menu_configs[i].visable = true;
      for (let j in menu_configs[i].options) {
        menu_configs[i].options[j].visable = true;
      }
    }

    return {
      menu_configs: menu_configs,
      search_keyword: ''
    };
  },
  methods: {
    clickOption: function (option) {
      this.$emit('option-clicked', option);
    }
  },
  watch: {
    search_keyword: function () {
      for (let i in this.menu_configs) {
        let is_match = false;
        for (let j in this.menu_configs[i].options) {
          if (this.search_keyword == '' || this.menu_configs[i].options[j].name.toLowerCase().indexOf(this.search_keyword.toLowerCase()) != -1) {
            this.menu_configs[i].options[j].visable = true;
            is_match = true;
          } else {
            this.menu_configs[i].options[j].visable = false;
          }
        }
        this.menu_configs[i].visable = is_match;
      }
    },
    sidebar_config: function () {
      let menu_configs = this.sidebar_config;
      for (let i in menu_configs) {
        menu_configs[i].visable = true;
        for (let j in menu_configs[i].options) {
          menu_configs[i].options[j].visable = true;
        }
      }
      this.menu_configs = menu_configs;
    }
  }
}
</script>
