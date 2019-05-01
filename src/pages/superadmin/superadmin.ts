import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DeviceProvider } from '../../providers/device/device';
import { BluetoothProvider } from '../../providers/bluetooth/bluetooth';

@IonicPage()
@Component({
  selector: 'page-superadmin',
  templateUrl: 'superadmin.html',
})
export class SuperadminPage {

  input = ''    // terminal || display

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public deviceProv: DeviceProvider,
    public bluetoothProv: BluetoothProvider

  ) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SuperadminPage');

  }

  send() {
    console.log('yess', this.input)
    bluetooth.send({ msg: this.input })
  }

  close() {
    this.navCtrl.setRoot("InputPage", this.deviceProv.terminalType)
  }
}
