import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { NfcProvider } from '../../providers/nfc/nfc';
import { BluetoothProvider } from '../../providers/bluetooth/bluetooth';

@IonicPage()
@Component({
  selector: 'page-output',
  templateUrl: 'output.html',
})
export class OutputPage {

  onGoing = false
  statusMsg = 'Ready'

  constructor(
    public navCtrl: NavController,
    private nfcProv: NfcProvider,
    private bluetoothProv: BluetoothProvider

    ) {
  }

  ionViewDidEnter() {
    if(!Object.keys(this.bluetoothProv.connectedDevice).length) this.statusMsg = 'Le moniteur est déconnecté !!'
  }

  book(price) {
    this.onGoing = true

    if(this.nfcProv.currentCard){

    }
    else{

    }
  }
}
