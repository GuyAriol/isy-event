import { Injectable, NgZone } from '@angular/core';
import { DeviceProvider } from '../device/device';
import { Broadcaster } from '@ionic-native/broadcaster';
import { DialogProvider } from '../dialog/dialog';

export interface bluetoothMsgType {
  cmd: string,
  from: string,
  msg: string
}

export interface bluetoothDeviceType {
  name: string,
  address: string
  isConnected: boolean
}

@Injectable()
export class BluetoothProvider {

  pairedDevices = []
  connectedDevice = {} as bluetoothDeviceType

  display = {} as bluetoothMsgType

  constructor(
    private deviceProv: DeviceProvider,
    private nativeBroadcast: Broadcaster,
    private dialogProv: DialogProvider,
    private ngZone: NgZone


  ) {

  }

  subscribeNativeEvent() {
    if (this.deviceProv.isCordova) {
      this.nativeBroadcast.addEventListener('iE-device-connected').subscribe(res => {
        this.connectedDevice = JSON.parse(res.data)
        this.dialogProv.dismissLoading()
      })

      this.nativeBroadcast.addEventListener('iE-msg-read').subscribe(res => {
        this.ngZone.run(() => {
          this.display = JSON.parse(res.data)
          console.log(this.display)
        })
      })
    }
  }
}

