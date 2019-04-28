import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DeviceProvider } from '../../providers/device/device';

@IonicPage()
@Component({
  selector: 'page-superadmin',
  templateUrl: 'superadmin.html',
})
export class SuperadminPage {

  isMenuConnectDevices = false
  connectedDevices = []

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private deviceProv: DeviceProvider,

  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SuperadminPage');
  }

  getPairedDevices() {
    if (this.deviceProv.isCordova) {
      bluetooth.startScan().then(devices => {
        console.log(devices)

        for (let deviceKey in devices) {
          this.connectedDevices.push(devices[deviceKey])
        }

        console.log(this.connectedDevices)
      })
    }
  }

  connectPairedDevice(deviceAddress){
    bluetooth.stopScan()
    bluetooth.connect({address: deviceAddress}).then(res => {

    })
  }


}
