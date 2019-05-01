import { Injectable } from '@angular/core';
import { global } from '../global';
import { Platform } from 'ionic-angular';

export interface bluetoothDeviceType {
  name: string,
  address: string
  isConnected: boolean
}

@Injectable()
export class DeviceProvider {

  isDesktop = false; isAndroid = false; isIos = false;
  isCordova = false; isWindowsPhone = false

  screenWidth = null; sreenHeight = null
  isAppBooting = 0

  constructor(
    private platform: Platform,

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

  }
}
