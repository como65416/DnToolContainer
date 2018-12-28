<template>
  <el-tabs v-model="activeName">
    <el-tab-pane label="Install Package" name="install_package">
      <el-table
        :data="packageInfos"
        height="450"
        style="width: 100%">
        <el-table-column
          label="Icon"
          width="60">
          <template slot-scope="scope">
            <img v-bind:src="scope.row.iconUrl" style="width:36px;height:36px;"></img>
          </template>
        </el-table-column>
        <el-table-column
          label="Name"
          width="240">
          <template slot-scope="scope">
            {{ scope.row.packageName }}
          </template>
        </el-table-column>
        <el-table-column
          label="Description">
          <template slot-scope="scope">
            {{ scope.row.description }}
          </template>
        </el-table-column>
        <el-table-column
          label=""
          width="140">
          <template slot-scope="scope">
            <el-button type="success" size="mini" style="width:120px;" icon="el-icon-plus" v-show="scope.row.status == 'not install'" @click="installPackage(scope.row)">Install</el-button>
            <el-button type="danger" size="mini" style="width:120px;margin-left: 0px;" icon="el-icon-delete" v-show="scope.row.status == 'installed'" @click="uninstallPackage(scope.row)">Uninstall</el-button>
            <el-button type="warning" size="mini" style="width:120px;margin-left: 0px;" icon="el-icon-loading" v-show="scope.row.status == 'installing'" disabled>Installing</el-button>
            <el-button type="warning" size="mini" style="width:120px;margin-left: 0px;" icon="el-icon-loading" v-show="scope.row.status == 'uninstalling'" disabled>Uninstalling</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-tab-pane>
    <el-tab-pane label="Setting" name="setting">
      Enable Tab Dev Tools:
      <el-switch
        v-model="is_dev_tools_enabled_"
        active-text=""
        inactive-text="">
      </el-switch>
    </el-tab-pane>
  </el-tabs>
</template>

<style scoped>
</style>

<script>
import PackageUtil from '../lib/PackageUtil';
import RcConfig from '../lib/RcConfig';

export default {
  props: ['is_dev_tools_enabled'],
  data() {
    return {
      activeName: 'install_package',
      packageInfos: [],
      is_dev_tools_enabled_: this.is_dev_tools_enabled
    };
  },
  created: function () {
    this.reloadPackageMenu();
  },
  methods: {
    reloadPackageMenu: function () {
      PackageUtil.getAllStorePackages().then(storePackages => {
        let installedPackages = PackageUtil.getInstalledPackages();
        let iconDirPath = RcConfig.getIconDirectoryPath();
        for (let installedPackage of installedPackages) {
          installedPackage.status = 'installed';
          installedPackage.downloadUrl = null;
          installedPackage.iconUrl = 'file://' + iconDirPath + installedPackage.icon;
        }
        let menu = installedPackages;

        for (let storePackage of storePackages) {
          let isInstelled = false;
          for (let option of menu) {
            if (option.host == storePackage.host && option.packageId == storePackage.packageId) {
              option.downloadUrl = storePackage.downloadUrl;
              option.iconUrl = storePackage.iconUrl;
              isInstelled = true;
              break;
            }
          }
          if (!isInstelled) {
            storePackage.status = 'not install';
            menu.push(storePackage);
          }
        }
        this.packageInfos = menu;
      });
    },
    installPackage(option) {
      let self = this;
      for (let i in this.packageInfos) {
        if (this.packageInfos[i].host == option.host && this.packageInfos[i].packageId == option.packageId) {
          let packageInfo = this.packageInfos[i];
          packageInfo.status = 'installing';
          PackageUtil.installPackage(packageInfo).then(function (res) {
            packageInfo.status = 'installed';
            packageInfo.path = res.path;
            packageInfo.icon = res.icon;
            self.$notify({
              title: 'Success',
              message: 'Install "' + packageInfo.packageName + '" Success',
              type: 'success'
            });
            self.$emit('packages-changed');
          }).catch(function (err) {
            packageInfo.status = 'not install';
            self.$notify.error({
              title: 'Error',
              message: 'Install "' + packageInfo.packageName + '" Fail',
            });
          });
          break;
        }
      }
    },
    uninstallPackage(option) {
      let self = this;
      if (confirm("Are you sure uninstall '" + option.packageName + "' ?")) {
        for (let i in this.packageInfos) {
          if (this.packageInfos[i].host == option.host && this.packageInfos[i].packageId == option.packageId) {
            let packageInfo = this.packageInfos[i];
            packageInfo.status = 'uninstalling';
            PackageUtil.uninstallPackage(packageInfo).then(() => {
              if (option.downloadUrl != null) {
                packageInfo.status = 'not install';
              } else {
                this.packageInfos = this.packageInfos.slice(0, i).concat(this.packageInfos.slice(i + 1));
              }
              self.$notify({
                title: 'Success',
                message: 'Uninstall "' + packageInfo.packageName + '" Success',
                type: 'success'
              });
              self.$emit('packages-changed');
            }).catch((e) => function () {
              packageInfo.status = 'installed';
              self.$notify.error({
                title: 'Error',
                message: 'Uninstall "' + packageInfo.packageName + '" Fail',
              });
            });
            break;
          }
        }
      }
    }
  },
  watch:{
    is_dev_tools_enabled_: function(val) {
      this.$emit('update:is_dev_tools_enabled', val);
    }
  }
}
</script>
