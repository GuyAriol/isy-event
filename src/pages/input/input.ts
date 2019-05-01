import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DeviceProvider } from '../../providers/device/device';
import { BluetoothProvider } from '../../providers/ble/bluetooth';


@IonicPage()
@Component({
  selector: 'page-input',
  templateUrl: 'input.html',
})
export class InputPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public deviceProv: DeviceProvider,
    public bluetoothProv: BluetoothProvider,


  ) {
    if (Object.keys(navParams.data).length) this.deviceProv.terminalType = navParams.data

  }

  ionViewDidLoad() {


  }

}
