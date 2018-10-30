import fs from 'fs';

/**
 * get storage path
 *
 * @return {string}
 */
function getStoragePath() {
  let homePath = global.process.env.HOME || global.process.env.USERPROFILE;
  let storagePath = homePath + "/.dn-tool-container/";
  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath);
  }
  return storagePath;
}

/**
 * get package install directory path
 *
 * @return {string}
 */
function getPackageInstallPath() {
  let storagePath = getStoragePath();
  let installPackagesPath = storagePath + "installed_packages/";
  if (!fs.existsSync(installPackagesPath)) {
    fs.mkdirSync(installPackagesPath);
  }
  return installPackagesPath;
}

/**
 * get package package icon director path
 * @return {string}
 */
function getIconDirectoryPath() {
  let installPath = getPackageInstallPath();
  let iconDirectory = installPath + "icon/";
  if (!fs.existsSync(iconDirectory)) {
    fs.mkdirSync(iconDirectory);
  }
  return iconDirectory;
}

/**
 * get temp directory
 *
 * @return {string}
 */
function getTempDirectoryPath() {
  let storagePath = getStoragePath();
  let tmpDirectory = storagePath + ".tmp/";
  if (!fs.existsSync(tmpDirectory)) {
    fs.mkdirSync(tmpDirectory);
  }
  return tmpDirectory;
}

/**
 * get package store urls
 *
 * @return {urls}
 */
function getPackageStoreUrls() {
  // TODO: use file to config urls
  return [
    'https://como65416.github.io/DnToolContainer-packages/packages/list.json'
  ];
}

export default {
  getStoragePath,
  getPackageInstallPath,
  getIconDirectoryPath,
  getTempDirectoryPath,
  getPackageStoreUrls
}