import { Injectable, NgZone } from '@angular/core';
import { DeviceProvider } from '../device/device';
import { Broadcaster } from '@ionic-native/broadcaster';
import { DialogProvider } from '../dialog/dialog';
import { Subscription } from 'rxjs/Subscription';
import { global } from '../global';
import { Events } from 'ionic-angular';

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
  deviceConnectedSubscription: Subscription
  messageReadSubscription: Subscription
  connectinLostSubscription: Subscription

  constructor(
    private deviceProv: DeviceProvider,
    private nativeBroadcast: Broadcaster,
    private dialogProv: DialogProvider,
    private ngZone: NgZone,
    private event: Events


  ) {

  }

  subscribeNativeEvent() {
    if (global.isDebug) {
      console.log('--BluetoothProvider-subscribeNativeEvent')
    }

    if (this.deviceProv.isCordova) {
      this.deviceConnectedSubscription = this.nativeBroadcast.addEventListener('iE-device-connected').subscribe(res => {
        this.dialogProv.dismissLoading()

        this.ngZone.run(() => {
          this.connectedDevice = JSON.parse(res.data)
          this.event.publish('iE-bluetooth connection')
        })

      })

      this.messageReadSubscription = this.nativeBroadcast.addEventListener('iE-msg-read').subscribe(res => {
        this.ngZone.run(() => {
          this.display = JSON.parse(res.data)
          console.log(this.display)
        })
      })

      this.connectinLostSubscription = this.nativeBroadcast.addEventListener('iE-device-disconnected').subscribe(res => {
        this.ngZone.run(() => {
          this.connectedDevice = { isConnected: false, address: '', name: '' }
          this.dialogProv.showSimpleDialog('Attention', '', "Le moniteur n'est plus connecté", 'Ok')
        })
      })
    }
  }

  unsubscribeNativeEvent() {
    if (global.isDebug) {
      console.log('--BluetoothProvider-unsubscribeNativeEvent')
    }

    this.deviceConnectedSubscription.unsubscribe()
    this.messageReadSubscription.unsubscribe()
    this.connectinLostSubscription.unsubscribe()
  }

}

