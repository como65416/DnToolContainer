import fs from 'fs';
import RcConfig from './RcConfig';
import axios from 'axios';
import http from 'http';
import https from 'https';
import AdmZip from 'adm-zip';
import rimraf from 'rimraf';

// install package from a url
function installPackage(packageInfo, successCb, failCb) {
  var tmpPath = RcConfig.getTempDirectoryPath();
  var tmpZipPath = tmpPath + Buffer.from("dn" + Math.random()).toString('base64') + ".zip";
  var zipFile = fs.createWriteStream(tmpZipPath);

  let packageUrl = packageInfo.downloadUrl;
  let matches = packageUrl.match(/^http[s]{0,1}:\/\/([^\/]+)/);
  let host = matches[1];

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
              if (!fs.existsSync(configPath)) {
                fs.writeFileSync(configPath, '[]');
              }
              let installPackageInfos = JSON.parse(fs.readFileSync(configPath));

              let newInfo = Object.assign({}, packageInfo);
              newInfo.icon = iconFileName;
              newInfo.directory = dirName;
              newInfo.packageFrom = host;
              delete newInfo.iconUrl;
              delete newInfo.downloadUrl;
              delete newInfo.status;
              installPackageInfos.push(newInfo);
              fs.writeFileSync(configPath, JSON.stringify(installPackageInfos, null, 4));
              successCb(newInfo);
            });
          });
        });
      });
    });
  }).on('error', function(err) {
    fs.unlinkSync(tmpZipPath);
    failCb(err.message);
  });
}

// uninstall a exist package
function uninstallPackage(packageInfo, successCb, failCb) {
  let installPackagesPath = RcConfig.getPackageInstallPath();
  let iconDirectoryPath = RcConfig.getIconDirectoryPath();
  let configPath = installPackagesPath + "packages.json";

  let installPackageInfos = JSON.parse(fs.readFileSync(configPath));
  for (let i in installPackageInfos) {
    if (installPackageInfos[i].packageId == packageInfo.packageId && installPackageInfos[i].packageFrom == packageInfo.packageFrom) {
      fs.unlinkSync(iconDirectoryPath + installPackageInfos[i].icon);
      rimraf(installPackagesPath + installPackageInfos[i].directory, function () {
        installPackageInfos.splice(i, 1);
        fs.writeFileSync(configPath, JSON.stringify(installPackageInfos, null, 4));
        successCb();
      });
      return;
    }
  }
  failCb();
}

// get all packages info from all package store
async function getAllStorePackages() {
  let storeUrls = RcConfig.getPackageStoreUrls();
  let packages = [];
  for (let storeUrl of storeUrls) {
    let config = {headers: {'Content-Type': 'application/json','Cache-Control' : 'no-cache'}};
    let response = await axios.get(storeUrl, config);
    let matches = storeUrl.match(/^http[s]{0,1}:\/\/([^\/]+)/);
    let host = matches[1];
    for (let pack of response.data) {
      pack.packageFrom = host;
      packages.push(pack);
    }
  }
  return packages;
}

// get all installed package information
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