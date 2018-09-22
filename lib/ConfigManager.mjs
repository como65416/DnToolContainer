import fs from 'fs';
import PackageUtil from './PackageUtil';

// get menu config
function getMenuConfig() {
  let configs = [];
  let config_id = 1;

  let installPackages = PackageUtil.getInstalledPackages();
  for (let i in installPackages) {
    installPackages[i].id = installPackages[i].packageFrom + "-" + installPackages[i].packageId;
    for (let j in installPackages[i].options) {
      installPackages[i].options[j].id = installPackages[i].id + "-" + j;
    }
  }
  return installPackages;
}

export default {
  getMenuConfig
}