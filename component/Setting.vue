<template>
  <el-tabs v-model="activeName">
    <el-tab-pane label="Install Package" name="install_package">
      <el-table
        :data="tableData"
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
      tableData: data.packages
    };
  },
  methods: {
    installPackage(option) {
      let self = this;
      for (let i in this.tableData) {
        if (this.tableData[i].packageFrom == option.packageFrom && this.tableData[i].packageId == option.packageId) {
          let tableData = this.tableData[i];
          tableData.status = 'installing';
          PackageUtil.installPackageFromUrl(this.tableData[i].downloadUrl, function (res) {
            tableData.status = 'installed';
            tableData.path = res.path;
            self.$notify({
              title: 'Success',
              message: 'Install "' + option.packageName + '" Success',
              type: 'success'
            });
            self.$emit('packages-changed', option);
          }, function (err) {
            tableData.status = 'not install';
            self.$notify.error({
              title: 'Error',
              message: 'Install "' + option.packageName + '" Fail',
            });
          });
          break;
        }
      }
    },
    uninstallPackage(option) {
      let self = this;
      if (confirm("Are you sure uninstall '" + option.packageName + "' ?")) {
        for (let i in this.tableData) {
          if (this.tableData[i].packageFrom == option.packageFrom && this.tableData[i].packageId == option.packageId) {
            let tableData = this.tableData[i];
            tableData.status = 'uninstalling';
            PackageUtil.uninstallPackage(option.path, function () {
              tableData.status = 'not install';
              self.$notify({
                title: 'Success',
                message: 'Uninstall "' + option.packageName + '" Success',
                type: 'success'
              });
              self.$emit('packages-changed', option);
            }, function () {
              tableData.status = 'installed';
              self.$notify.error({
                title: 'Error',
                message: 'Uninstall "' + option.packageName + '" Fail',
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
