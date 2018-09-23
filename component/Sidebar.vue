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
        v-for="(packageInfo, index) in packageInfos"
        v-bind:index="packageInfo.id"
        v-show="packageInfo.visable"
        :key="packageInfo.id">
        <template slot="title">
          <img v-bind:src="icon_directory_path + packageInfo.icon" style="height:25px;" />
          <span slot="title">{{ packageInfo.packageName }}</span>
        </template>
        <el-menu-item
          v-for="(option, index2) in packageInfo.options"
          v-bind:index="option.id"
          v-on:click="clickOption(packageInfo, index2)"
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
import RcConfig from './../lib/RcConfig';

export default {
  props: ['sidebar_config'],
  data() {
    let packageInfos = this.sidebar_config;
    for (let i in packageInfos) {
      packageInfos[i].visable = true;
      for (let j in packageInfos[i].options) {
        packageInfos[i].options[j].visable = true;
      }
    }

    return {
      packageInfos: packageInfos,
      search_keyword: '',
      icon_directory_path: RcConfig.getIconDirectoryPath(),
      package_install_path: RcConfig.getPackageInstallPath()
    };
  },
  methods: {
    clickOption: function (packageInfo, option_index) {
      let info = {
        name: packageInfo.options[option_index].name,
        uri: this.package_install_path + packageInfo.directory + "/" + packageInfo.options[option_index].uri,
        id: packageInfo.packageId + "-" + option_index
      }
      this.$emit('option-clicked', info);
    }
  },
  watch: {
    search_keyword: function () {
      for (let i in this.packageInfos) {
        let is_match = false;
        for (let j in this.packageInfos[i].options) {
          if (this.search_keyword == '' || this.packageInfos[i].options[j].name.toLowerCase().indexOf(this.search_keyword.toLowerCase()) != -1) {
            this.packageInfos[i].options[j].visable = true;
            is_match = true;
          } else {
            this.packageInfos[i].options[j].visable = false;
          }
        }
        this.packageInfos[i].visable = is_match;
      }
    },
    sidebar_config: function () {
      let packageInfos = this.sidebar_config;
      for (let i in packageInfos) {
        packageInfos[i].visable = true;
        for (let j in packageInfos[i].options) {
          packageInfos[i].options[j].visable = true;
        }
      }
      this.packageInfos = packageInfos;
    }
  }
}
</script>
