import { Injectable } from '@angular/core';
import { global } from '../global';
import { Platform } from 'ionic-angular';
import { StorageProvider } from '../storage/storage';

export enum terminalEnum { terminal, display, none }

@Injectable()
export class DeviceProvider {

  isDesktop = false; isAndroid = false; isIos = false;
  isCordova = false; isWindowsPhone = false

  screenWidth = null; sreenHeight = null
  isAppBooting = 0

  terminalType: terminalEnum = terminalEnum.none
  bluetoothInfo = ''

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
  getCurrentPlatform(): Promise<any> {
    if (global.isDebug) {
      console.log('--DeviceProvider-getCurrentPlatform');
    }

    return new Promise((resolve, reject) => {
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
        console.log('test', res)
        if (res != null) this.terminalType = res

        this.getLocalBluetoothInfo()

        resolve()
      })

    })
  }

  setDeviceType(arg) {
    console.log(arg)
    this.terminalType = arg
    this.storageProv.setToLocalStorage('iE_deviceType', this.terminalType)
  }

  private getLocalBluetoothInfo() {
    if (global.isDebug) {
      console.log('--DeviceProvider-getLocalBluetoothInfo')
    }

    if (this.platform.is('cordova')) {
      bluetooth.getLocalBluetoothName()
        .then(data => {
          this.bluetoothInfo = data

          console.log(this.bluetoothInfo)
        })
        .catch(error => console.log(error))
    }

  }
}
