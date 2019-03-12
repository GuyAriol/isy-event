import { Injectable } from '@angular/core';
import { NFC, Ndef } from '@ionic-native/nfc';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class DeviceProvider {

  isNFC = false; isNFCwriting = false
  nfcSubscription: Subscription

  constructor(
    private nfc: NFC,
    private ndef: Ndef,


  ) {

  }

  subscribeNFC() {
    console.log('--DeviceProvider-subscribeNFC')

    this.nfc.enabled()
      .then(result => {

        if (result == 'NFC_OK') {
          let observable = this.nfc.addNdefListener(() => {
            this.isNFC = true
            console.log('NFC supported, NDEF listener started')
          },
            error => {
              console.log(error)
              console.log('Error attaching NDEF listener')
            })

          this.nfcSubscription = observable.subscribe(event => {
            this.handleNFCread(event.tag)
          })
        }
      })
      .catch(error => {
        console.log(error)
      })
  }

  unsubscribeNFC() {
    console.log('--DeviceProvider-unsubscribeNFC')

    try {
      this.nfcSubscription.unsubscribe()

    } catch (error) {
      console.log(error)
    }
  }

  handleNFCread(tag): Promise<any> {
    return new Promise((resolve, reject) => {

      if (tag.ndefMessage && !this.isNFCwriting) {
        let payload = tag.ndefMessage[0].payload
        console.log(this.nfc.bytesToString(payload).substring(3))

      }
    });
  }

}
