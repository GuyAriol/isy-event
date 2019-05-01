import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DeviceProvider, bluetoothDeviceType } from '../../providers/device/device';
import { Broadcaster } from '@ionic-native/broadcaster';
import { DialogProvider } from '../../providers/dialog/dialog';

@IonicPage()
@Component({
  selector: 'page-superadmin',
  templateUrl: 'superadmin.html',
})
export class SuperadminPage {

  isMenuConnectDevices = false
  pairedDevices = []
  connectedDevice = {} as bluetoothDeviceType
  input = ''

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private deviceProv: DeviceProvider,
    private nativeBroadcast: Broadcaster,
    private dialogProv: DialogProvider

  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SuperadminPage');

    if (this.deviceProv.isCordova) {
      this.nativeBroadcast.addEventListener('iE-device-connected').subscribe(res => {
        this.connectedDevice = JSON.parse(res.data)
        this.dialogProv.dismissLoading()
      })

      this.nativeBroadcast.addEventListener('iE-msg-read').subscribe(res => {
        console.log(res.data)
      })
    }

  }

  getPairedDevices() {
    if (this.deviceProv.isCordova) {
      bluetooth.startScan().then(devices => {
        console.log(devices)

        for (let deviceKey in devices) {
          this.pairedDevices.push(devices[deviceKey])
        }

        console.log(this.pairedDevices)
      })
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


}
