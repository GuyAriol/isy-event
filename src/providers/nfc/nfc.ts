import { Injectable } from '@angular/core';
import { NFC, Ndef } from '@ionic-native/nfc';
import { DeviceProvider } from '../device/device';
import { Subscription } from 'rxjs/Subscription';

export interface nfcType {
  cmdType: nfcCmdEnum,
  balanceKey: string,
  id: string
}

// 1-4 -> id
// 5-6 -> cmd
// 7-16 -> balanceKey

export enum nfcCmdEnum { setTerminalCredentials, login, }

@Injectable()
export class NfcProvider {

  isNFC = false; isNFCwriting = false
  nfcSubscription: Subscription

  constructor(
    private nfc: NFC,
    private ndef: Ndef,
    private deviceprov: DeviceProvider,


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
            console.log(event)
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

  private handleNFCread(tag): Promise<any> {
    return new Promise((resolve, reject) => {

      if (tag.ndefMessage && !this.isNFCwriting) {
        let payload = tag.ndefMessage[0].payload
        console.log(this.nfc.bytesToString(payload).substring(3))

      }
    });
  }

  private writeNFC(msg): Promise<any> {
    return new Promise((resolve, reject) => {

      let tag = [
        this.ndef.textRecord(msg),
        this.ndef.uriRecord("https://vihautech.net")
      ]

      this.nfc.write(tag)
        .then(result => {
          console.log(result)
          this.isNFCwriting = false

          resolve()
        }, error => {
          this.isNFCwriting = false
          console.log(error)
          reject()
        })
        .catch(error => {
          console.log(error)
          this.isNFCwriting = false
        })
    });
  }

  setCardID() {

  }

  updateBalance() {

  }

  setTerminalCredentials() {

  }
}
