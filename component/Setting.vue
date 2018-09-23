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
  </el-tabs>
</template>

<style scoped>
</style>

<script>
import PackageUtil from '../lib/PackageUtil';

let data = {
  packages : []
};

PackageUtil.getAllStorePackages().then(storePackages => {
  let installPackages = PackageUtil.getInstalledPackages();
  for (let storePackage of storePackages) {
    let installed = false;
    for (let installPackage of installPackages) {
      if (installPackage.packageFrom == storePackage.packageFrom && installPackage.packageId == storePackage.packageId) {
        storePackage.path = installPackage.path;
        storePackage.icon = installPackage.icon;
        installed = true;
        break;
      }
    }
    storePackage.status = (installed) ? 'installed' : 'not install' ;
  }
  data.packages = storePackages;
});

export default {
  data() {
    return {
      activeName: 'install_package',
      packageInfos: data.packages
    };
  },
  methods: {
    installPackage(option) {
      let self = this;
      for (let i in this.packageInfos) {
        if (this.packageInfos[i].packageFrom == option.packageFrom && this.packageInfos[i].packageId == option.packageId) {
          let packageInfo = this.packageInfos[i];
          packageInfo.status = 'installing';
          PackageUtil.installPackage(packageInfo, function (res) {
            packageInfo.status = 'installed';
            packageInfo.path = res.path;
            self.$notify({
              title: 'Success',
              message: 'Install "' + packageInfo.packageName + '" Success',
              type: 'success'
            });
            self.$emit('packages-changed');
          }, function (err) {
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
          if (this.packageInfos[i].packageFrom == option.packageFrom && this.packageInfos[i].packageId == option.packageId) {
            let packageInfo = this.packageInfos[i];
            packageInfo.status = 'uninstalling';
            PackageUtil.uninstallPackage(packageInfo, function () {
              packageInfo.status = 'not install';
              self.$notify({
                title: 'Success',
                message: 'Uninstall "' + packageInfo.packageName + '" Success',
                type: 'success'
              });
              self.$emit('packages-changed');
            }, function () {
              packageInfo.status = 'installed';
              self.$notify.error({
                title: 'Error',
                message: 'Uninstall "' + packageInfo.packageName + '" Fail',
              });
            })
            break;
          }
        }
      }
    }
  }
}
</script>
