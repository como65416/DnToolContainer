import fs from 'fs';
import RcConfig from './RcConfig';
import axios from 'axios';
import http from 'http';
import AdmZip from 'adm-zip';
import rimraf from 'rimraf';

// install package from a url
function installPackageFromUrl(url, successCb, failCb) {
  var path = Buffer.from("dn" + Math.random()).toString('base64') + ".zip";
  var file = fs.createWriteStream(path);
  let matches = url.match(/^http[s]{0,1}:\/\/([^\/]+)/);
  let host = matches[1];

  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(function () {
        let installPackagesPath = RcConfig.getPackageInstallPath();
        let dirName = "pak-" + (new Date().getTime());

        var zip = new AdmZip(path);
      	var zipEntries = zip.getEntries();
        zip.extractAllTo(installPackagesPath + dirName, true);
        fs.unlinkSync(path);

        let configPath = installPackagesPath + "packages.json";
        if (!fs.existsSync(configPath)) {
          fs.writeFileSync(configPath, '[]');
        }
        let installPackageInfos = JSON.parse(fs.readFileSync(configPath));
        let newInfo = {
          packageFrom: host,
          path: dirName
        };
        installPackageInfos.push(newInfo);
        fs.writeFileSync(configPath, JSON.stringify(installPackageInfos, null, 4));
        successCb(newInfo);
      });
    });
  }).on('error', function(err) {
    fs.unlinkSync(path);
    failCb(err.message);
  });
}

// uninstall a exist package
function uninstallPackage(packageDir, successCb, failCb) {
  let installPackagesPath = RcConfig.getPackageInstallPath();
  let dirPath = installPackagesPath + packageDir;
  let configPath = installPackagesPath + "packages.json";

  let installPackageInfos = JSON.parse(fs.readFileSync(configPath));
  for (let i in installPackageInfos) {
    if (installPackageInfos[i].path == packageDir) {
      installPackageInfos.splice(i, 1);
      break;
    }
  }
  rimraf(dirPath, function () {
    fs.writeFileSync(configPath, JSON.stringify(installPackageInfos, null, 4));
    successCb();
  });
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

  let configs = [];
  for (let installPackageInfo of installPackageInfos) {
    let packageConfigPath = installPackagesPath + installPackageInfo.path + "/config.json";
    if (!fs.existsSync(packageConfigPath)) {
      continue;
    }

    let packageConfig = JSON.parse(fs.readFileSync(packageConfigPath));
    let config = {};
    config.path = installPackageInfo.path;
    config.packageFrom = installPackageInfo.packageFrom;
    config.packageId = packageConfig.packageId;
    config.packageName = packageConfig.packageName;
    let options = [];
    for (let i in packageConfig.options) {
      let option = {};
      option.name = packageConfig.options[i].name;
      option.uri = installPackagesPath + installPackageInfo.path + "/" + packageConfig.options[i].uri;
      options.push(option);
    }
    config.options = options;
    config.icon_uri = installPackagesPath + installPackageInfo.path + "/icon.png";
    if (!fs.existsSync(config.icon_uri)) {
      config.icon_uri = null;
    }
    configs.push(config);
  }

  return configs;
}

export default {
  installPackageFromUrl,
  uninstallPackage,
  getAllStorePackages,
  getInstalledPackages
}