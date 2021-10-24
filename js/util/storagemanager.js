'use strict';

class StorageManager {
  static storage = window.localStorage;
  constructor() {
    // nada
  };
  static getLocalStorage(storageName) {
    return StorageManager.storage.getItem(storageName);
  };
  static setLocalStorage(storageName, data) {
    StorageManager.storage.setItem(storageName, data);
  };
  static clear() {
    StorageManager.storage.clear();
  };
};