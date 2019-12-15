<template>
  <el-tabs v-model="activeName">
    <!-- Package Store -->
    <el-tab-pane label="Packages Store" name="packages_store">
      <el-table :data="packageStoreList" height="360" style="width: 100%">
        <el-table-column label="Icon" width="60">
          <template slot-scope="scope">
            <img v-bind:src="scope.row.iconUrl" style="width:36px;height:36px;"></img>
          </template>
        </el-table-column>
        <el-table-column label="Name" width="240">
          <template slot-scope="scope">
            <div style="font-size:14px;"><strong>{{ scope.row.packageName }}</strong></div>
            <div style="text-align:right; font-size:12px;">Provide by <span style="color:blue;">{{ scope.row.provideStoreName }}</span></div>
          </template>
        </el-table-column>
        <el-table-column label="Description">
          <template slot-scope="scope">
            {{ scope.row.description }}
          </template>
        </el-table-column>
        <el-table-column width="140">
          <template slot-scope="scope">
            <el-button type="success" size="mini" icon="el-icon-plus" v-if="scope.row.status == 'not install'" @click="installPackage(scope.row.packageId)">Install</el-button>
            <el-button type="warning" size="mini" icon="el-icon-loading" v-if="scope.row.status == 'installing'" disabled>Installing</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-tab-pane>

    <!-- installed packages -->
    <el-tab-pane label="Installed Package" name="installed_packages">
      <el-table :data="installedPackageList" height="360" style="width: 100%">
        <el-table-column label="Icon" width="60">
          <template slot-scope="scope">
            <img v-bind:src="scope.row.iconUri" style="width:36px;height:36px;"></img>
          </template>
        </el-table-column>
        <el-table-column label="Name" width="240">
          <template slot-scope="scope">
            <div style="font-size:14px;"><strong>{{ scope.row.packageName }}</strong></div>
            <div style="text-align:right; font-size:12px;">Installed from <span style="color:blue;">{{ scope.row.installFrom }}</span></div>
          </template>
        </el-table-column>
        <el-table-column label="Description">
          <template slot-scope="scope">
            {{ scope.row.description }}
          </template>
        </el-table-column>
        <el-table-column width="140">
          <template slot-scope="scope">
            <el-button type="danger" size="mini" icon="el-icon-delete" v-if="scope.row.status == 'installed'" @click="uninstallPackage(scope.row.packageId)">Uninstall</el-button>
            <el-button type="warning" size="mini" icon="el-icon-loading" v-if="scope.row.status == 'uninstalling'" disabled>Uninstalling</el-button>
          </template>
        </el-table-column>
      </el-table>
      <br />
      <el-button type="primary" size="small" @click="installCustomPacakage()"><i class="el-icon-plus"></i> Install Custom Package</el-button>
    </el-tab-pane>

    <!-- manage store -->
    <el-tab-pane label="Manage Store" name="manage_store">
      <el-table :data="storeDatas" style="width: 100%">
        <el-table-column width="70" label="Icon">
          <template slot-scope="scope">
            <img style="width:36px; height:36px;" :src="scope.row.iconUrl" v-show="scope.row.iconUrl != '' && scope.row.iconUrl != null"/>
          </template>
        </el-table-column>
        <el-table-column width="70" label="Status">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.isAlive === true" type="success" size="small" effect="plain" icon="el-icon-search">Alive</el-tag>
            <el-tag v-else-if="scope.row.isAlive === false" type="danger" size="small" effect="plain" icon="el-icon-search">Error</el-tag>
          </template>
        </el-table-column>
        <el-table-column width="160" label="Store Name">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="API">
          <template slot-scope="scope">
            <el-input v-if="scope.row.isEditing" v-model="scope.row.apiUrl"></el-input>
            <span v-else>{{ scope.row.apiUrl.substring(0, 22) }}...</span>
          </template>
        </el-table-column>
        <el-table-column>
          <template slot-scope="scope">
            <el-button
              @click.native.prevent="saveStore(scope.$index)"
              v-if="scope.row.isEditing"
              size="small"
              type="success"
              icon="el-icon-check">
              Save
            </el-button>
            <el-button
              @click.native.prevent="editStore(scope.$index)"
              v-else
              size="small"
              type="primary"
              icon="el-icon-edit">
              Edit
            </el-button>
            <el-button
              @click.native.prevent="deleteStore(scope.$index)"
              size="small"
              type="danger"
              icon="el-icon-delete">
              Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <br />
      <el-button size="medium" type="success" @click="addStore()">Add Store</el-button>
    </el-tab-pane>

    <!-- setting -->
    <el-tab-pane label="Setting" name="setting">
      <h3>
        Enable Tab Dev Tools :
        <el-switch v-model="isDevToolsEnabled"></el-switch>
      </h3>
    </el-tab-pane>
  </el-tabs>
</template>

<style scoped>
</style>

<script>
import PackageStoreUtil from '../lib/PackageStoreUtil';
import PackageUtil from '../lib/PackageUtil';
import RcConfig from '../lib/RcConfig';
import { remote as electron } from 'electron';
import fs from 'fs';

export default {
  data() {
    return {
      activeName: 'packages_store',
      installingPackageIds: [],
      uninstallingPackageIds: [],
      storePackageInfos: [],
      storeDatas: []
    };
  },
  created: function () {
    this.reloadStorePackageInfos();
    this.reloadStoreInfos();
  },
  methods: {
    notifyMessage: function (type, message) {
      if (type == 'error') {
        this.$notify.error({
          title: 'Error',
          message: message,
        });
      } else if (type == 'success') {
        this.$notify({
          title: 'Success',
          message: message,
          type: 'success'
        });
      }
    },
    reloadStorePackageInfos: async function () {
      this.storePackageInfos = await PackageStoreUtil.getAllStorePackages();
    },
    reloadStoreInfos: async function () {
      this.storeDatas = (await PackageStoreUtil.getAppStoreDatas())
        .map(data => Object.assign(data, {isEditing: false}));
    },
    addStore: function () {
      this.storeDatas.push({
        id: null,
        name: "",
        iconUrl: "",
        apiUrl: "",
        isAlive: null,
        isEditing: true
      });
    },
    saveStore: function (index) {
      let storeId = this.storeDatas[index].id;
      try {
        if (storeId != null) {
          PackageStoreUtil.updateStore(storeId, this.storeDatas[index]);
        } else {
          let createdId = PackageStoreUtil.createStore(this.storeDatas[index]);
          this.storeDatas[index].id = createdId;
        }
        this.reloadStoreInfos();
        this.reloadStorePackageInfos();
        this.storeDatas[index].isEditing = false;
      } catch (error) {
        this.notifyMessage('error', error);
      }
    },
    editStore: function (index) {
      this.storeDatas[index].isEditing = true;
    },
    deleteStore: function (index) {
      let storeId = this.storeDatas[index].id;
      if (confirm("Are you sure delete the store?")) {
        if (storeId != null) {
          PackageStoreUtil.deleteStore(storeId);
        }
        this.storeDatas.splice(index, 1);
        this.reloadStorePackageInfos();
      }
    },
    installPackage: function(packageId) {
      let targetInfo = this.storePackageInfos.find(packageInfo => packageInfo.packageId == packageId);

      this.installingPackageIds.push(packageId);
      PackageUtil.downloadPackage(targetInfo.downloadUrl)
        .then(packagePath => {
          PackageUtil.installPackage(packagePath, targetInfo.provideStoreName)
            .then(info => {
              this.notifyMessage('success', 'Install Success');
              this.$store.commit('reloadInstalledPackages');
            })
            .catch(err => {
              this.notifyMessage('error', 'Install Fail : ' + err);
            })
            .finally(() => {
              fs.unlinkSync(packagePath);
            });
        })
        .then(info => {
          this.notifyMessage('success', 'Install "' + targetInfo.packageName + '" Success');
          this.$store.commit('reloadInstalledPackages');
          this.installingPackageIds.splice(this.installingPackageIds.indexOf(packageId), 1);
        })
        .catch(error => {
          this.notifyMessage('error', 'Install "' + targetInfo.packageName + '" Fail : ' + error,);
          this.installingPackageIds.splice(this.installingPackageIds.indexOf(packageId), 1);
        });
    },
    installCustomPacakage() {
      let selectedFiles = electron.dialog.showOpenDialogSync({ properties: ['openFile'] });
      if (selectedFiles != null) {
        let packagePath = selectedFiles[0];
        PackageUtil.installPackage(packagePath, "Custom Package")
          .then(info => {
            this.notifyMessage('success', 'Install Success');
            this.$store.commit('reloadInstalledPackages');
          })
          .catch(err => {
            this.notifyMessage('error', 'Install Fail : ' + err);
          });
      }
    },
    uninstallPackage(packageId) {
      let installedPackageInfos = this.$store.state.installedPackages;
      let targetInfo = installedPackageInfos.find(packageInfo => packageInfo.packageId == packageId);

      if (confirm("Are you sure uninstall '" + targetInfo.packageName + "' ?")) {
        this.uninstallingPackageIds.push(packageId);
        PackageUtil.uninstallPackage(packageId)
          .then(() => {
            this.notifyMessage('success', 'Uninstall "' + targetInfo.packageName + '" Success');
            this.uninstallingPackageIds.splice(this.uninstallingPackageIds.indexOf(packageId), 1);
            this.$store.commit('reloadInstalledPackages');
          }).catch(err => {
            this.notifyMessage('error', 'Uninstall "' + targetInfo.packageName + '" Fail');
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
