import fs from 'fs';
import PackageUtil from './PackageUtil';

/**
 * get package menu config
 *
 * @return {Object} structure : {
 *      "host": "package host",
 *      "id": "package id",
 *      "packageId": "package id",
 *      "packageName": "package name",
 *      "description": "package description",
 *      "icon": "icon file name",
 *      "directory": "directory name",
 *      "options": [
 *          {
 *              "id": "package option id"
 *              "name": "package option name"
 *              "uri": "html file path (relative direction)",
 *          },
 *          ...
 *      ]
 *  }
 */
function getSidebarMenuConfig() {
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
  getSidebarMenuConfig
}