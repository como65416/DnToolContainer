import axios from 'axios';
import fs from 'fs';
import RcConfig from './RcConfig';
import CryptoJS from 'crypto-js';

/**
 * config save path
 * @type {string}
 */
let configPath = RcConfig.getStoragePath() + "/stores.json";

/**
 * get package store datas
 *
 * @return [
 *   {
 *      id: id,
 *      name: name,
 *      iconUrl: iconUrl,
 *      apiUrl: apiUrl
 *   },
 *   ...
 * ]
 */
async function getAppStoreDatas() {
  let storeDatas = readStoreDatas();

  for (let storeData of storeDatas) {
    try {
      let response = await axios.get(storeData.apiUrl);
      storeData.name = response.data.storeName;
      storeData.iconUrl = response.data.storeIcon;
      storeData.isAlive = true;
    } catch (error) {
      storeData.iconUrl = null;
      storeData.isAlive = false;
    }
  }
  saveStoreDatas(storeDatas);

  return storeDatas;
}

/**
 * @param  {object}
 * {
 *   name: name,
 *   apiUrl: apiUrl
 * }
 * @return {int} created store id
 * @throws {string} if create store failed
 */
function createStore(createData) {
  let storeDatas = readStoreDatas();
  let targetData = storeDatas.find(data => data.apiUrl == createData.apiUrl);
  if (targetData != null) {
    throw "Store already exist";
  }
  let secretKey = "FSADgaf7fsd";
  let createdId = CryptoJS.AES.encrypt(createData.apiUrl, secretKey).toString()
  storeDatas.push(Object.assign({id: createdId}, {name: createData.name, apiUrl: createData.apiUrl}));
  saveStoreDatas(storeDatas);
  return createdId;
}

/**
 * @param  {string} storeId
 * @param  {object} data
 * {
 *   name: name,
 *   apiUrl: apiUrl
 * }
 */
function updateStore(storeId, updateData) {
  let storeDatas = readStoreDatas();
  let targetData = storeDatas.find(data => data.id == storeId);
  Object.assign(targetData, {
    apiUrl: updateData.apiUrl
  });
  saveStoreDatas(storeDatas);
}

function deleteStore(storeId) {
  let storeDatas = readStoreDatas();
  let targetIndex = storeDatas.findIndex(data => data.id == storeId);
  storeDatas.splice(targetIndex, 1);
  saveStoreDatas(storeDatas);
}

/**
 * get all packages info from all package store
 *
 * @return {Object} structure : [
 *    {
 *      packageId: 'package id',
 *      version: 'version',
 *      packageName: 'package name',
 *      iconUrl: 'package icon url',
 *      description: 'package description',
 *      downloadUrl: 'package download url(zip file)'
 *    },
 *    ...
 * ]
 */
async function getAllStorePackages() {
  let appStoreDatas = await getAppStoreDatas();
  let packages = [];
  let config = {headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-cache'}};
  for (let appStoreData of appStoreDatas) {
    let response = await axios.get(appStoreData.apiUrl, config);
    let storeName = response.data.storeName;
    let storePackages = response.data.packages;
    for (let storePackage of storePackages) {
      if (packages.find(data => data.packageId == storePackage.packageId) == null) {
        packages.push(Object.assign({}, storePackage, {
          provideStoreName: storeName
        }));
      }
    }
  }

  return packages;
}

/**
 * @param  {array} content
 * [
 *   {
 *     id: id,
 *     name: name,
 *     apiUrl: apiUrl
 *   },
 *   ...
 * ]
 */
function readStoreDatas() {
  if (!fs.existsSync(configPath)) {
    saveStoreDatas([
      {
        "id": "U2FsdGVkX19JXGUcwVa8uCuglXBGXWL465k1mrnCbRFX1gjFfqOhD6KB+I3HMF59OeeiNW80f1A0G1CguFgfZMvz3XUi/8jDrB08Trem1fNfcihpDUgIIQYEwrv2Guf1",
        "name": "DN Tool Store",
        "apiUrl": "https://como65416.github.io/DnToolContainer-packages/packages/api.v1.json"
      }
    ]);
  }
  return JSON.parse(fs.readFileSync(configPath));
}

/**
 * @param  {array} content
 * [
 *   {
 *     id: id,
 *     name: name,
 *     apiUrl: apiUrl
 *   },
 *   ...
 * ]
 */
function saveStoreDatas(content) {
  fs.writeFileSync(configPath, JSON.stringify(content, null, 2));
}

export default {
  getAllStorePackages,
  getAppStoreDatas,
  createStore,
  updateStore,
  deleteStore
}
