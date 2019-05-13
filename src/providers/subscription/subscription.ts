import { Injectable } from '@angular/core';
import { NfcProvider } from '../nfc/nfc';
import { Events } from 'ionic-angular';
import { UserProvider } from '../user/user';
import { StorageProvider } from '../storage/storage';

@Injectable()
export class SubscriptionProvider {

  constructor(
    private nfcProv: NfcProvider,
    private event: Events,
    private userProv: UserProvider,
    private storageProv: StorageProvider

  ) {

  }

  defaultSubscription(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.nfcProv.subscribeNFC()
      this.userProv.getCurrentEvent()
      this.nfcProv.getAllTransactions()
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

    this.storageProv.removeFromLocalStorage('iE_currentEvent')
    this.storageProv.removeFromLocalStorage('iE_user')
    this.storageProv.removeFromLocalStorage('iE_deviceType')

  }
}
