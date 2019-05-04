import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController, ViewController } from 'ionic-angular';
import { DeviceProvider } from '../../providers/device/device';
import { BluetoothProvider } from '../../providers/bluetooth/bluetooth';
import { DialogProvider } from '../../providers/dialog/dialog';
import { NfcProvider, nfcCardType, nfcCmdEnum, userRoleEnum } from '../../providers/nfc/nfc';
import { UserProvider } from '../../providers/user/user';


@IonicPage()
@Component({
  selector: 'page-input',
  templateUrl: 'input.html',
})
export class InputPage {

  isMenuDevice = false
  input = ''

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public deviceProv: DeviceProvider,
    public bluetoothProv: BluetoothProvider,
    private dialogProv: DialogProvider,
    public nfcProv: NfcProvider,
    public popoverCtrl: PopoverController,
    private userProv: UserProvider


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

  superAdmin() {
    this.navCtrl.setRoot('SuperadminPage')
  }

  numPad(input) {
    this.input += input
  }

  backscape() {
    this.input = this.input.substr(0, this.input.length - 1)
  }

  putMoney() {
    if (this.input) {
      let card: nfcCardType = {
        id: '',
        cmdType: nfcCmdEnum.none,
        balance: parseFloat(this.input),
        maxsize: '',
        type: '',
        role: userRoleEnum.client,
        cardOk: false,
        eventId: this.userProv.currentEventID,
        eventName: this.userProv.currentUser.events[this.userProv.currentEventID].title
      }

      this.nfcProv.updateBalance(card).then(() => {

        bluetooth.send({ msg: this.nfcProv.currentCard.balance })
      })
    }
    else {
      this.dialogProv.showToast('Vérifiez le mountant')
    }

  }

  logOff(event) {
    let popover = this.popoverCtrl.create(PopoverPage)
    popover.present({ ev: event })
  }
}

@Component({
  template: `
    <ion-list>
      <ion-list-header>Mrs Sandra</ion-list-header>
      <button ion-item (click)="close()">Verouiller l'écran</button>
    </ion-list>
  `
})

export class PopoverPage {
  constructor(
    public viewCtrl: ViewController,
    public navCtrl: NavController,
  ) { }

  close() {
    this.viewCtrl.dismiss();
    this.navCtrl.setRoot('IntroPage')
  }
}
