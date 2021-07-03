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
async function installPackage(packageFilePath, packageFrom) {
  let installPackagesPath = RcConfig.getPackageInstallPath();
  let dirName = "pak-" + (new Date().getTime());
  let packageDir = installPackagesPath + dirName;

  var zip = new AdmZip(packageFilePath);
  zip.extractAllTo(packageDir, true);

  let manifestPath = packageDir + "/dn-manifest.json";
  if (!fs.existsSync(manifestPath)) {
    rimraf(packageDir, function () {});
    throw new Error('dn-manifest.json not found');
  } else {
    let mainifestContent = JSON.parse(fs.readFileSync(manifestPath));
    let keyNotExists = ['packageId', 'version', 'packageName', 'iconFile', 'description', 'options'].filter(x => !Object.keys(mainifestContent).includes(x));
    // check dn-manifest.json
    if (keyNotExists.length != 0) {
      throw new Error('dn-manifest.json ' + keyNotExists.join(',') + ' not write');
    }
    // check is installed or not
    if (getInstalledPackages().find(pacakgeInfo => pacakgeInfo.packageId == mainifestContent.packageId) != null) {
      throw new Error('this package already installed');
    }
    // check icon and options file exists or not
    if (!fs.existsSync(packageDir + '/' + mainifestContent.iconFile)) {
      throw new Error('icon not found');
    }
    for (let option of mainifestContent.options) {
      if (!fs.existsSync(packageDir + "/" + option.file)) {
        rimraf(packageDir, function () {});
        throw new Error(`${option.file} not found`);
      }
    }
  }

  // update packages.json
  let configPath = installPackagesPath + "packages.json";
  let packageInfos = (fs.existsSync(configPath)) ? JSON.parse(fs.readFileSync(configPath)): [];
  packageInfos.push({
    dir: dirName,
    installFrom: packageFrom,
    installTime: Math.ceil(((new Date).getTime() / 1000)),
  });
  fs.writeFileSync(configPath, JSON.stringify(packageInfos, null, 4));
  return manifestPath;
}

/**
 * uninstall a exist package
 *
 * @param  {Object} packageId package id
 */
async function uninstallPackage(packageId) {
  let installPackagesPath = RcConfig.getPackageInstallPath();
  let configPath = installPackagesPath + "packages.json";
  let packageInfos = JSON.parse(fs.readFileSync(configPath));
  for (let i in packageInfos) {
    let packageDir = packageInfos[i].dir;
    let manifestContent = JSON.parse(fs.readFileSync(installPackagesPath + "/" + packageDir + "/dn-manifest.json"));
    if (manifestContent.packageId == packageId) {
      packageInfos.splice(i, 1);
      fs.writeFileSync(configPath, JSON.stringify(packageInfos, null, 4));
      rimraf(installPackagesPath + packageDir, function () {});
    }
  }
}

/**
 * get all installed package information
 * @return {Object} structure : [
 *   {
 *     "packageId": "package id",
 *     "packageName": "package name",
 *     "directory": "package save dirname",
 *     "iconUri": "icon image file uri",
 *     "description": "package description",
 *     "installFrom": "install from",
 *     "options": [
 *       {
 *         name: 'option name',
 *         fileUri: 'html file uri'
 *       },
 *       ...
 *     ]
 *   }
 * ]
 */
function getInstalledPackages() {
  let installPackagesPath = RcConfig.getPackageInstallPath();

  let configPath = installPackagesPath + "packages.json";
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, '[]');
  }
  let packageInfos = JSON.parse(fs.readFileSync(configPath));
  let installPackageInfos = [];
  for (let packageInfo of packageInfos) {
    let packageDir = packageInfo.dir;
    let installFrom = packageInfo.installFrom;
    let content = JSON.parse(fs.readFileSync(installPackagesPath + packageDir + "/dn-manifest.json"));
    content.iconUri = "file://" + installPackagesPath + packageDir + "/" + content.iconFile;
    content.options.map(option => Object.assign(option, {fileUri: "file://" + installPackagesPath + packageDir + "/" + option.file}));
    installPackageInfos.push(Object.assign({}, content, {installFrom}));
  }
  return installPackageInfos;
}

export default {
  downloadPackage,
  installPackage,
  uninstallPackage,
  getInstalledPackages
}
