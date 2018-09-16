import fs from 'fs'

// get storage path
function getStoragePath() {
  let homePath = global.process.env.HOME || global.process.env.USERPROFILE;
  let storagePath = homePath + "/.dn-tool-container/";
  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath);
  }
  return storagePath;
}

// get menu config
function getMenuConfig() {
  let configs = [];
  let config_id = 1;
  let storagePath = getStoragePath();

  let packages_path = storagePath + "installed_packages/";
  if (!fs.existsSync(packages_path)) {
    fs.mkdirSync(packages_path);
  }
  console.log(packages_path);

  let package_dirs = fs.readdirSync(packages_path);
  for (let package_dir of package_dirs) {
    let config_path = packages_path + package_dir + "/config.json";
    if (fs.existsSync(config_path)) {
      let contents = fs.readFileSync(config_path);
      let new_config = JSON.parse(contents);
      new_config.icon_uri = packages_path + package_dir + "/icon.png";
      new_config.id = config_id++;
      for (let i in new_config['options']) {
        new_config['options'][i]['id'] = config_id + "-" + i;
        new_config['options'][i]['uri'] = packages_path + package_dir + '/' + new_config['options'][i]['uri'];
      }
      configs.push(new_config);
    }
  }
  return configs;
}

export default {
  getMenuConfig
}