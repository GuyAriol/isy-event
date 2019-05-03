import { Injectable } from '@angular/core';
import { NfcProvider } from '../nfc/nfc';

@Injectable()
export class SubscriptionProvider {

  constructor(
    private nfcProv: NfcProvider,

  ) {

  }

  defaultSubscription(): Promise<any> {
    return new Promise((resolve, reject) => {
     this.nfcProv.subscribeNFC()

      resolve()
    });
  }

  userSubscription(): Promise<any> {
    return new Promise((resolve, reject) => {

    });
  }

  defaultUnscription() {
    this.nfcProv.unsubscribeNFC()


  }
}
