import { Injectable } from '@angular/core';
import { NfcProvider } from '../nfc/nfc';
import { Events } from 'ionic-angular';

@Injectable()
export class SubscriptionProvider {

  constructor(
    private nfcProv: NfcProvider,
    private event: Events,


  ) {

  }

  defaultSubscription(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.nfcProv.subscribeNFC()

      resolve()
    });
  }

  userSubscription() {

  }

  defaultUnscription() {
    this.nfcProv.unsubscribeNFC()

    this.event.unsubscribe('login')
  }


}
