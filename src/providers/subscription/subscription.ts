import { Injectable } from '@angular/core';
import { NfcProvider } from '../nfc/nfc';
import { Events } from 'ionic-angular';
import { UserProvider } from '../user/user';

@Injectable()
export class SubscriptionProvider {

  constructor(
    private nfcProv: NfcProvider,
    private event: Events,
    private userProv: UserProvider

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
  }
}
