import fs from 'fs';
import RcConfig from './RcConfig';
import http from 'http';
import https from 'https';
import AdmZip from 'adm-zip';
import rimraf from 'rimraf';

/**
 * download package to a temp path
 *
 * @param  {string} packageUrl
 */
function downloadPackage(packageUrl) {
  var tmpPath = RcConfig.getTempDirectoryPath();
  var tmpSaveFilePath = tmpPath + Buffer.from("dn" + Math.random()).toString('base64') + ".zip";
  var saveFile = fs.createWriteStream(tmpSaveFilePath);

  return new Promise(function(resolve, reject) {
    let httpClient = (packageUrl.indexOf('https://') == 0) ? https : http ;
      httpClient.get(packageUrl, function(response) {
      response.pipe(saveFile);
      saveFile.on('finish', function() {
        saveFile.close(function () {
          resolve(tmpSaveFilePath);
        });
      });
    }).on('error', function(err) {
      fs.unlinkSync(tmpSaveFilePath);
      resolve(err.message);
    })
  });
}

/**
 * install pakcage by file path
 *
 * @param  {string} packageFilePath
 */
function installPackage(packageFilePath) {
  return new Promise(function (resolve, reject) {
    let installPackagesPath = RcConfig.getPackageInstallPath();
    let dirName = "pak-" + (new Date().getTime());
    let packageDir = installPackagesPath + dirName;

    var zip = new AdmZip(packageFilePath);
    var zipEntries = zip.getEntries();
    zip.extractAllTo(packageDir, true);

    let manifestPath = packageDir + "/dn-manifest.json";
    if (!fs.existsSync(manifestPath)) {
      reject('dn-manifest.json not found');
      rimraf(packageDir, function () {});
      return;
    } else {
      let mainifestContent = JSON.parse(fs.readFileSync(manifestPath));
      let keyNotExists = ['packageId', 'version', 'packageName', 'iconFile', 'description', 'options'].filter(x => !Object.keys(mainifestContent).includes(x));
      // check dn-manifest.json
      if (keyNotExists.length != 0) {
        reject("dn-manifest.json " + keyNotExists.join(",") + " not write");
        return;
      }
      // check is installed or not
      if (getInstalledPackages().find(pacakgeInfo => pacakgeInfo.packageId == mainifestContent.packageId) != null) {
        reject("this package already installed");
        return;
      }
      // check icon and options file exists or not
      if (!fs.existsSync(packageDir + "/" + mainifestContent.iconFile)) {
        reject('icon not found');
        return;
      }
      for (let option of mainifestContent.options) {
        if (!fs.existsSync(packageDir + "/" + option.file)) {
          reject(option.file + ' not found');
          rimraf(packageDir, function () {});
          return;
        }
      }
    }

    // update packages.json
    let configPath = installPackagesPath + "packages.json";
    let packageDirs = (fs.existsSync(configPath)) ? JSON.parse(fs.readFileSync(configPath)): [];
    packageDirs.push(dirName);
    fs.writeFileSync(configPath, JSON.stringify(packageDirs, null, 4));
    resolve(manifestPath);
  });
}

/**
 * uninstall a exist package
 *
 * @param  {Object} packageId package id
 */
function uninstallPackage(packageId) {
  return new Promise(function (resolve, reject) {
    let installPackagesPath = RcConfig.getPackageInstallPath();
    let configPath = installPackagesPath + "packages.json";
    let packageDirs = JSON.parse(fs.readFileSync(configPath));
    for (let i in packageDirs) {
      let manifestContent = JSON.parse(fs.readFileSync(installPackagesPath + "/" + packageDirs[i] + "/dn-manifest.json"));
      if (manifestContent.packageId == packageId) {
        let path = packageDirs[i];
        packageDirs.splice(i, 1);
        fs.writeFileSync(configPath, JSON.stringify(packageDirs, null, 4));
        rimraf(path, function () {});
        resolve();
      }
    }
  });
}

/**
 * get all installed package information
 * @return {Object} structure : [
 *     {
 *         "packageId": "package id",
 *         "packageName": "package name",
 *         "directory": "package save dirname",
 *         "iconUri": "icon image file uri",
 *         "description": "package description",
 *         "options": [
 *             {
 *                 name: 'option name',
 *                 fileUri: 'html file uri'
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
  let packageDirs = JSON.parse(fs.readFileSync(configPath));
  let installPackageInfos = [];
  for (let packageDir of packageDirs) {
    let content = JSON.parse(fs.readFileSync(installPackagesPath + packageDir + "/dn-manifest.json"));
    content.iconUri = "file://" + installPackagesPath + packageDir + "/" + content.iconFile;
    content.options.map(option => Object.assign(option, {fileUri: "file://" + installPackagesPath + packageDir + "/" + option.file}));
    installPackageInfos.push(content);
  }
  return installPackageInfos;
}

export default {
  downloadPackage,
  installPackage,
  uninstallPackage,
  getInstalledPackages
}