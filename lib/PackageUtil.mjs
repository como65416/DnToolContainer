import fs from 'fs';
import RcConfig from './RcConfig';
import axios from 'axios';
import http from 'http';
import https from 'https';
import AdmZip from 'adm-zip';
import rimraf from 'rimraf';

/**
 * install pakcage by packageInfo
 *
 * @param  {Object} packageInfo package information structure : {
 *     host: 'package host',
 *     packageId : 'package id',
 *     downloadUrl : 'package download url',
 *     iconUrl : 'icon url',
 *     options : [
 *         {
 *            name : "package url",
 *            uri : "html file name in zip"
 *         },
 *         ...
 *     ]
 * }
 */
function installPackage(packageInfo) {
  return new Promise(function (resolve, reject) {
    var tmpPath = RcConfig.getTempDirectoryPath();
    var tmpZipPath = tmpPath + Buffer.from("dn" + Math.random()).toString('base64') + ".zip";
    var zipFile = fs.createWriteStream(tmpZipPath);
    let packageUrl = packageInfo.downloadUrl;

    // Download Package
    let httpClient = (packageUrl.indexOf('https://') == 0) ? https : http ;
    let request = httpClient.get(packageUrl, function(response) {
      response.pipe(zipFile);
      zipFile.on('finish', function() {
        zipFile.close(function () {
          let installPackagesPath = RcConfig.getPackageInstallPath();
          let dirName = "pak-" + (new Date().getTime());

          var zip = new AdmZip(tmpZipPath);
          var zipEntries = zip.getEntries();
          zip.extractAllTo(installPackagesPath + dirName, true);
          fs.unlinkSync(tmpZipPath);

          // Download Package icon
          let iconDirectoryPath = RcConfig.getIconDirectoryPath();
          let iconUrl = packageInfo.iconUrl;
          let httpClient = (iconUrl.indexOf('https://') == 0) ? https : http ;
          var iconFileName = (new Date().getTime()) + ".png"
          var iconFile = fs.createWriteStream(iconDirectoryPath + iconFileName);
          httpClient.get(iconUrl, function(response) {
            response.pipe(iconFile);
            iconFile.on('finish', function() {
              iconFile.close(function () {
                let configPath = installPackagesPath + "packages.json";
                let installedPackageInfos = (fs.existsSync(configPath)) ? JSON.parse(fs.readFileSync(configPath)): [];
                let newInfo = Object.assign({}, packageInfo);
                newInfo.icon = iconFileName;
                newInfo.directory = dirName;
                ['iconUrl', 'downloadUrl', 'status'].forEach(e => delete newInfo[e]);
                installedPackageInfos.push(newInfo);
                fs.writeFileSync(configPath, JSON.stringify(installedPackageInfos, null, 4));
                resolve(newInfo);
              });
            });
          });
        });
      });
    }).on('error', function(err) {
      fs.unlinkSync(tmpZipPath);
      resolve(err.message);
    });
  });
}

/**
 * uninstall a exist package
 *
 * @param  {Object} packageInfo package infomation structure: {
 *     host: 'package host',
 *     packageId: 'package id'
 * }
 */
function uninstallPackage(packageInfo) {
  return new Promise(function (resolve, reject) {
    let installPackagesPath = RcConfig.getPackageInstallPath();
    let iconDirectoryPath = RcConfig.getIconDirectoryPath();
    let configPath = installPackagesPath + "packages.json";

    let installPackageInfos = JSON.parse(fs.readFileSync(configPath));
    for (let i in installPackageInfos) {
      if (installPackageInfos[i].packageId == packageInfo.packageId && installPackageInfos[i].host == packageInfo.host) {
        fs.unlinkSync(iconDirectoryPath + installPackageInfos[i].icon);
        rimraf(installPackagesPath + installPackageInfos[i].directory, function () {
          installPackageInfos.splice(i, 1);
          fs.writeFileSync(configPath, JSON.stringify(installPackageInfos, null, 4));
          resolve();
        });
        return;
      }
    }
    reject("Package Not Found");
  });
}

/**
 * get all packages info from all package store
 *
 * @return {Object} structure : [
 *    packageId: 'package id',
 *    packageName: 'package name',
 *    iconUrl: 'package icon url',
 *    description: 'package description',
 *    downloadUrl: 'package download url(zip file)',
 *    options: [
 *        {
 *            name: 'option name',
 *            uri: 'html file path in zip'
 *        },
 *        ...
 *    ]
 * ]
 */
async function getAllStorePackages() {
  let storeUrls = RcConfig.getPackageStoreUrls();
  let packages = [];
  for (let storeUrl of storeUrls) {
    let config = {headers: {'Content-Type': 'application/json','Cache-Control' : 'no-cache'}};
    let response = await axios.get(storeUrl, config);
    let matches = storeUrl.match(/^http[s]{0,1}:\/\/([^\/]+)/);
    let host = matches[1];
    for (let pack of response.data) {
      pack.host = host;
      packages.push(pack);
    }
  }
  return packages;
}

/**
 * get all installed package information
 * @return {Object} structure : [
 *     {
 *         "host": "package host",
 *         "packageId": "package id",
 *         "packageName": "package name",
 *         "directory": "package save dirname",
 *         "icon": "icon image file name",
 *         "description": "package description",
 *         "options": [
 *             {
 *                 name: 'option name',
 *                 uri: 'html file path in zip'
 *             },
 *             ...
 *         ]
 *     }
 * ]
 */
function getInstalledPackages() {
  let installPackagesPath = RcConfig.getPackageInstallPath();

  let configPath = installPackagesPath + "packages.json";
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, '[]');
  }
  let installPackageInfos = JSON.parse(fs.readFileSync(configPath));
  return installPackageInfos;
}

export default {
  installPackage,
  uninstallPackage,
  getAllStorePackages,
  getInstalledPackages
}