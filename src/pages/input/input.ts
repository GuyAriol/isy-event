import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DeviceProvider } from '../../providers/device/device';
import { BluetoothProvider } from '../../providers/bluetooth/bluetooth';
import { DialogProvider } from '../../providers/dialog/dialog';


@IonicPage()
@Component({
  selector: 'page-input',
  templateUrl: 'input.html',
})
export class InputPage {

  isMenuDevice = false

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public deviceProv: DeviceProvider,
    public bluetoothProv: BluetoothProvider,
    private dialogProv: DialogProvider


  ) {
    if (Object.keys(navParams.data).length) this.deviceProv.terminalType = navParams.data

  }

  ionViewDidLoad() {

  }

  connection() {
    this.isMenuDevice = true

    if (this.bluetoothProv.connectedDevice.isConnected) {
      bluetooth.disconnect()
      this.bluetoothProv.connectedDevice = { isConnected: false, address: '', name: '' }
    }
    else {
      this.bluetoothProv.pairedDevices = []

      if (this.deviceProv.isCordova) {
        bluetooth.startScan().then(devices => {
          console.log(devices)

          for (let deviceKey in devices) {
            this.bluetoothProv.pairedDevices.push(devices[deviceKey])
          }

          console.log(this.bluetoothProv.pairedDevices)
        })
      }
    }
  }

  connectPairedDevice(deviceAddress) {
    this.dialogProv.showLoading('scanning', 10000)

    bluetooth.stopScan()
    bluetooth.connect({ address: deviceAddress }).then(res => {
      console.log(res)
    })
  }

  superAdmin(){
    this.navCtrl.setRoot('SuperadminPage')
  }
}
