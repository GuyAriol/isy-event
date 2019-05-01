import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DeviceProvider } from '../../providers/device/device';
import { Broadcaster } from '@ionic-native/broadcaster';

@IonicPage()
@Component({
  selector: 'page-superadmin',
  templateUrl: 'superadmin.html',
})
export class SuperadminPage {

  isMenuConnectDevices = false
  connectedDevices = []
  connectedDevice = ''
  input = ''

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private deviceProv: DeviceProvider,
    private nativeBroadcast: Broadcaster

  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SuperadminPage');

    if(this.deviceProv.isCordova){
      this.nativeBroadcast.addEventListener('iE-device-connected').subscribe(res => {
        console.log(res.data)
        this.connectedDevice = res.data
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
          this.connectedDevices.push(devices[deviceKey])
        }

        console.log(this.connectedDevices)
      })
    }
  }

  connectPairedDevice(deviceAddress){
    bluetooth.stopScan()
    bluetooth.connect({address: deviceAddress}).then(res => {
      console.log(res)
    })
  }

  send(){
    console.log('yess', this.input)
    bluetooth.send({msg: this.input})
  }


}
