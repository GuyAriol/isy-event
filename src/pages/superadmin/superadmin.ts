import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DeviceProvider, terminalEnum } from '../../providers/device/device';
import { DialogProvider } from '../../providers/dialog/dialog';
import { BluetoothProvider } from '../../providers/ble/bluetooth';

@IonicPage()
@Component({
  selector: 'page-superadmin',
  templateUrl: 'superadmin.html',
})
export class SuperadminPage {

  isMenuConnectDevices = false
  input = ''    // terminal || display

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public deviceProv: DeviceProvider,
    private dialogProv: DialogProvider,
    public bluetoothProv: BluetoothProvider

  ) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SuperadminPage');

  }

  connection() {
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

  send() {
    console.log('yess', this.input)
    bluetooth.send({ msg: this.input })
  }

  close() {
    this.navCtrl.setRoot("InputPage", this.deviceProv.terminalType)
  }
}
