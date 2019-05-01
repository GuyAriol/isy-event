import { Injectable } from '@angular/core';
import { global } from '../global';
import { Platform } from 'ionic-angular';
import { StorageProvider } from '../storage/storage';

export interface bluetoothDeviceType {
  name: string,
  address: string
  isConnected: boolean
}

export enum terminalEnum { terminal, display }

@Injectable()
export class DeviceProvider {

  isDesktop = false; isAndroid = false; isIos = false;
  isCordova = false; isWindowsPhone = false

  screenWidth = null; sreenHeight = null
  isAppBooting = 0

  terminalType: terminalEnum = 0

  constructor(
    private platform: Platform,
    private storageProv: StorageProvider,


  ) {

  }

  /** Get all informations of current device
     *
     * @returns {Promise<any>}
     * @memberof DeviceProvider
     */
  getCurrentPlatform() {
    if (global.isDebug) {
      console.log('--DeviceProvider-getCurrentPlatform');
    }

    let platform = this.platform.platforms()

    if (platform.length && platform[0] == 'core') {
      this.isDesktop = true
    }
    else if (platform.indexOf('android') != -1) {
      this.isAndroid = true
    }
    else if (platform.indexOf('ios') != -1) {
      this.isIos = true
    }
    else if (platform.indexOf('windows') != -1) {
      this.isWindowsPhone = true
    }

    this.isCordova = this.platform.is('cordova')

    this.sreenHeight = this.platform.height()
    this.screenWidth = this.platform.width()

    this.storageProv.getFromLocalStorage('iE_deviceType').then(res => {
      if (res) this.terminalType = res
    })

  }

  setDeviceType(arg) {
    console.log(arg)
    this.terminalType = arg
    this.storageProv.setToLocalStorage('iE_deviceType', this.terminalType)
  }
}
