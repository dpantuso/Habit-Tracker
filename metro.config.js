const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable Watchman explicitly
config.watchFolderRoot = __dirname;
config.resolver.watchFolders = [__dirname];
config.watcher = {
  watchman: {
    enabled: true
  }
};

module.exports = config; 