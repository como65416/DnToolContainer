<template>
  <el-tabs v-model="activeName">
    <!-- Package Store -->
    <el-tab-pane label="Packages Store" name="packages_store">
      <el-table
        :data="packageStoreList"
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
            <el-button type="success" size="mini" style="width:120px;" icon="el-icon-plus" v-show="scope.row.status == 'not install'" @click="installPackage(scope.row.packageId)">Install</el-button>
            <el-button type="warning" size="mini" style="width:120px;margin-left: 0px;" icon="el-icon-loading" v-show="scope.row.status == 'installing'" disabled>Installing</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-tab-pane>

    <!-- installed packages -->
    <el-tab-pane label="Installed Package" name="installed_packages">
      <el-table
        :data="installedPackageList"
        height="450"
        style="width: 100%">
        <el-table-column
          label="Icon"
          width="60">
          <template slot-scope="scope">
            <img v-bind:src="scope.row.iconUri" style="width:36px;height:36px;"></img>
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
            <el-button type="danger" size="mini" style="width:120px;margin-left: 0px;" icon="el-icon-delete" v-show="scope.row.status == 'installed'" @click="uninstallPackage(scope.row.packageId)">Uninstall</el-button>
            <el-button type="warning" size="mini" style="width:120px;margin-left: 0px;" icon="el-icon-loading" v-show="scope.row.status == 'uninstalling'" disabled>Uninstalling</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-tab-pane>

    <!-- setting -->
    <el-tab-pane label="Setting" name="setting">
      Enable Tab Dev Tools:
      <el-switch
        v-model="isDevToolsEnabled"
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
  data() {
    return {
      activeName: 'packages_store',
      installingPackageIds: [],
      uninstallingPackageIds: [],
      storePackageInfos: []
    };
  },
  created: function () {
    this.reloadStorePackageInfos();
  },
  methods: {
    reloadStorePackageInfos: function () {
      PackageUtil.getAllStorePackages().then(storePackages => {
        this.storePackageInfos = storePackages;
      });
    },
    installPackage: function(packageId) {
      let targetInfo = this.storePackageInfos.find(packageInfo => packageInfo.packageId == packageId);

      this.installingPackageIds.push(packageId);
      PackageUtil.downloadPackage(targetInfo.downloadUrl)
        .then(package_path => PackageUtil.installPackage(package_path))
        .then(info => {
          this.$notify({
            title: 'Success',
            message: 'Install "' + targetInfo.packageName + '" Success',
            type: 'success'
          });
          this.$store.commit('reloadInstalledPackages');
          this.installingPackageIds.splice(this.installingPackageIds.indexOf(packageId), 1);
        })
        .catch(error => {
          this.$notify.error({
            title: 'Error',
            message: 'Install "' + targetInfo.packageName + '" Fail',
          });
          this.installingPackageIds.splice(this.installingPackageIds.indexOf(packageId), 1);
        });
    },
    uninstallPackage(packageId) {
      let installedPackageInfos = this.$store.state.installedPackages;
      let targetInfo = installedPackageInfos.find(packageInfo => packageInfo.packageId == packageId);

      if (confirm("Are you sure uninstall '" + targetInfo.packageName + "' ?")) {
        this.uninstallingPackageIds.push(packageId);
        PackageUtil.uninstallPackage(packageId)
          .then(() => {
            this.$notify({
              title: 'Success',
              message: 'Uninstall "' + targetInfo.packageName + '" Success',
              type: 'success'
            });
            this.uninstallingPackageIds.splice(this.uninstallingPackageIds.indexOf(packageId), 1);
            this.$store.commit('reloadInstalledPackages');
          }).catch(err => {
            this.$notify.error({
              title: 'Error',
              message: 'Uninstall "' + targetInfo.packageName + '" Fail',
            });
            this.uninstallingPackageIds.splice(this.uninstallingPackageIds.indexOf(packageId), 1);
          });
      }
    }
  },
  computed: {
    isDevToolsEnabled: {
      get() {
        return this.$store.state.isDevToolsEnabled;
      },
      set(val) {
        this.$store.commit('changeDevToolsEnableStatus', val)
      }
    },
    packageStoreList: function () {
      let installedPackageInfos = this.$store.state.installedPackages;
      let installPackageIds = installedPackageInfos.map(packageInfo => packageInfo.packageId);

      let packageList = [];
      let storePackages = this.storePackageInfos;
      for (let packageInfo of storePackages) {
        if (installPackageIds.indexOf(packageInfo.packageId) == -1) {
          packageInfo.status = (this.installingPackageIds.indexOf(packageInfo.packageId) == -1) ? 'not install' : 'installing' ;
          packageList.push(packageInfo);
        }
      }
      return packageList;
    },
    installedPackageList: function () {
      let installedPackageInfos = this.$store.state.installedPackages;
      let installPackageIds = installedPackageInfos.map(packageInfo => packageInfo.packageId);

      let packageList = [];
      for (let packageInfo of installedPackageInfos) {
        packageInfo.status = (this.uninstallingPackageIds.indexOf(packageInfo.packageId) == -1) ? 'installed' : 'uninstalling' ;
        packageList.push(packageInfo);
      }
      return packageList;
    }
  }
}
</script>
