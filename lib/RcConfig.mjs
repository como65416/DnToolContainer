import fs from 'fs';

// get storage path
function getStoragePath() {
  let homePath = global.process.env.HOME || global.process.env.USERPROFILE;
  let storagePath = homePath + "/.dn-tool-container/";
  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath);
  }
  return storagePath;
}

// get package install directory path
function getPackageInstallPath() {
  let storagePath = getStoragePath();
  let installPackagesPath = storagePath + "installed_packages/";
  if (!fs.existsSync(installPackagesPath)) {
    fs.mkdirSync(installPackagesPath);
  }
  return installPackagesPath;
}

// get package store urls
function getPackageStoreUrls() {
  // TODO: usage file to config urls
  return [
    'https://como65416.github.io/DnToolContainer/packages/packageList.json'
  ];
}

export default {
  getStoragePath,
  getPackageInstallPath,
  getPackageStoreUrls
}