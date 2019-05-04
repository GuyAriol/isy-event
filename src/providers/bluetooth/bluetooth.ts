import { Injectable, NgZone } from '@angular/core';
import { DeviceProvider, bluetoothDeviceType } from '../device/device';
import { Broadcaster } from '@ionic-native/broadcaster';
import { DialogProvider } from '../dialog/dialog';

export interface bluetoothMsgType {
  cmd: string,
  from: string,
  msg: string
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
        this.dialogProv.dismissLoading()

        this.ngZone.run(() => {
          this.connectedDevice = JSON.parse(res.data)
        })

      })

      this.nativeBroadcast.addEventListener('iE-msg-read').subscribe(res => {
        this.ngZone.run(() => {
          this.display = JSON.parse(res.data)
          console.log(this.display)
        })
      })

      this.nativeBroadcast.addEventListener('iE-device-disconnected').subscribe(res => {
        this.ngZone.run(() => {
          this.connectedDevice = { isConnected: false, address: '', name: '' }
          this.dialogProv.showSimpleDialog('Attention', '', "Le moniteur n'est plus connecté", 'Ok')
        })
      })
    }
  }

}

