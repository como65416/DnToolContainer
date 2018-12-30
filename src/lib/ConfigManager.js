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
  for (let installPackage of installPackages) {
    installPackage.id = installPackage.packageFrom + "-" + installPackage.packageId;
    installPackage.options.map((option, index) => Object.assign(option, {id: installPackage.id + "-" + index}));
  }
  return installPackages;
}

export default {
  getSidebarMenuConfig
}