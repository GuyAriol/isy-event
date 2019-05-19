import { Injectable } from '@angular/core';
import { NfcProvider } from '../nfc/nfc';
import { Events } from 'ionic-angular';
import { UserProvider } from '../user/user';
import { StorageProvider } from '../storage/storage';
import { BluetoothProvider } from '../bluetooth/bluetooth';
import { NetworkProvider } from '../network/network';

@Injectable()
export class SubscriptionProvider {

  constructor(
    private nfcProv: NfcProvider,
    private event: Events,
    private userProv: UserProvider,
    private storageProv: StorageProvider,
    private bluetoothProv: BluetoothProvider,
    private networkProv: NetworkProvider

  ) {

  }

  defaultSubscription(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.nfcProv.subscribeNFC()
      this.userProv.getCurrentEvent()
      this.nfcProv.getAllTransactions()
      this.networkProv.subscribeNetwork()

      resolve()
    });
  }

  userSubscription(userId): Promise<any> {
    return new Promise((resolve, reject) => {
      this.userProv.subscribeUser(userId)

      resolve()
    });
  }

  defaultUnscription() {
    this.nfcProv.unsubscribeNFC()
    this.event.unsubscribe('login')
    this.userProv.unsubscribeUser()
    this.bluetoothProv.unsubscribeNativeEvent()

    this.storageProv.removeFromLocalStorage('iE_currentEvent')
    this.storageProv.removeFromLocalStorage('iE_user')
    this.storageProv.removeFromLocalStorage('iE_deviceType')
    this.storageProv.removeFromLocalStorage('iE_eventLog')

    this.networkProv.unsubscribeNetwork()
  }
}
