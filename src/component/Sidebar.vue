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
        v-for="packageInfo in menuList"
        v-bind:index="packageInfo.packageId"
        v-show="packageInfo.visable"
        :key="packageInfo.id">
        <template slot="title">
          <img v-bind:src="packageInfo.iconUri" style="height:25px;" />
          <span slot="title">{{ packageInfo.packageName }}</span>
        </template>
        <el-menu-item
          v-for="(option, index) in packageInfo.options"
          v-bind:index="option.fileUri"
          v-on:click="clickOption(packageInfo, index)"
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
  data() {
    return {
      search_keyword: ''
    };
  },
  methods: {
    clickOption: function (packageInfo, index) {
      let info = {
        name: packageInfo.options[index].name,
        uri: packageInfo.options[index].fileUri,
        id: packageInfo.packageId + "-" + index
      }
      this.$emit('option-clicked', info);
    }
  },
  watch: {
  },
  computed: {
    menuList: function () {
      let packageInfos = this.$store.state.installedPackages;
      for (let packageInfo of packageInfos) {
        for (let option of packageInfo.options) {
          option.visable = (this.search_keyword == '' || option.name.toLowerCase().indexOf(this.search_keyword.toLowerCase()) != -1);
        }
        packageInfo.visable = packageInfo.options.some(option => option.visable == true);
      }
      return packageInfos;
    }
  }
}
</script>
