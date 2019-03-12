import { Injectable } from '@angular/core';
import { NFC, Ndef } from '@ionic-native/nfc';
import { DeviceProvider } from '../device/device';

@Injectable()
export class NfcProvider {

  constructor(
    private nfc: NFC,
    private ndef: Ndef,
    private deviceprov: DeviceProvider,


  ) {

  }

  writeNFC(msg): Promise<any> {
    return new Promise((resolve, reject) => {

      let tag = [
        this.ndef.textRecord(msg),
        this.ndef.uriRecord("https://vihautech.net")
      ]

      this.nfc.write(tag)
        .then(result => {
          console.log(result)
          this.deviceprov.isNFCwriting = false

          resolve()
        }, error => {
          this.deviceprov.isNFCwriting = false
          console.log(error)
          reject()
        })
        .catch(error => {
          console.log(error)
          this.deviceprov.isNFCwriting = false
        })
    });
  }

}
