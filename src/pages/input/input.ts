import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController, ViewController } from 'ionic-angular';
import { DeviceProvider } from '../../providers/device/device';
import { BluetoothProvider } from '../../providers/bluetooth/bluetooth';
import { DialogProvider } from '../../providers/dialog/dialog';
import { NfcProvider, nfcCardType, nfcCmdEnum, userRoleEnum } from '../../providers/nfc/nfc';
import { UserProvider } from '../../providers/user/user';
import { StorageProvider } from '../../providers/storage/storage';
import { logType } from '../../providers/global';

enum stateEnum { ongoing, pass, fail, error, idle }

@IonicPage()
@Component({
  selector: 'page-input',
  templateUrl: 'input.html',
})
export class InputPage {

  isMenuDevice = false
  input: string = ''

  state: stateEnum = stateEnum.idle
  color = 'goldenrod'

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
      this.state = stateEnum.ongoing
      this.color = 'grey'

      let card: nfcCardType = {
        id: '',
        cmdType: nfcCmdEnum.none,
        balance: parseFloat(this.input)+this.nfcProv.currentCard.balance,
        maxsize: '',
        type: '',
        role: userRoleEnum.client,
        cardOk: false,
        eventId: this.userProv.currentEventID,
        eventName: this.userProv.currentUser.events[this.userProv.currentEventID].title,
        workerName: ' '
      }

      this.nfcProv.updateBalance(card)
        .then(pass => {

          bluetooth.send({ msg: this.nfcProv.currentCard.balance })

          this.input = ''
          this.state = stateEnum.pass
          this.color = 'green'

          console.log('pass', pass)
        },
          fail => {
            this.state = stateEnum.fail
            this.color = 'red'

            this.dialogProv.showToast('Vérifiez la carte')
          })
        .catch(error => {
          this.state = stateEnum.error
          this.color = 'red'
          console.log(error)
        })
    }
    else {
      this.dialogProv.showToast('Vérifiez le mountant')
    }

  }

  removeMoney() {
    if (this.input) {
      if (parseFloat(this.input) > this.nfcProv.currentCard.balance) this.dialogProv
        .showToast(`Vous pouvez débourser au maximum ${this.nfcProv.currentCard.balance} euro`)
      else {
        this.state = stateEnum.ongoing
        this.color = 'grey'

        let card: nfcCardType = {
          id: '',
          cmdType: nfcCmdEnum.none,
          balance: this.nfcProv.currentCard.balance - parseFloat(this.input),
          maxsize: '',
          type: '',
          role: userRoleEnum.client,
          cardOk: false,
          eventId: this.userProv.currentEventID,
          eventName: this.userProv.currentUser.events[this.userProv.currentEventID].title,
          workerName: ' '
        }

        this.nfcProv.updateBalance(card)
          .then(pass => {

            bluetooth.send({ msg: this.nfcProv.currentCard.balance })

            this.input = ''
            this.state = stateEnum.pass
            this.color = 'green'

            console.log('pass', pass)
          },
            fail => {
              this.state = stateEnum.fail
              this.color = 'red'

              this.dialogProv.showToast('Vérifiez la carte')
            })
          .catch(error => {
            this.state = stateEnum.error
            this.color = 'red'
            console.log(error)
          })
      }
    }
    else {
      this.dialogProv.showToast('Entrez le montant à rembourser')
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
      <ion-item>
        <ion-label>Total caise: {{total}} euro</ion-label>
      </ion-item>

      <div *ngFor="let worker of workerList">
        <ion-item>
          <p><b>{{worker.name}}</b></p>
          <p>{{worker.total}} </p>
        </ion-item>
      </div>

      <button ion-item (click)="close()">Verouiller l'écran</button>
      <button ion-item (click)="openAdmin()">Admin</button>
      </ion-list>
  `
})

export class PopoverPage {

  total = 0
  workerLogs = {}
  workerList = []

  constructor(
    public viewCtrl: ViewController,
    public navCtrl: NavController,
    private storageProv: StorageProvider,

  ) {
    this.storageProv.getFromLocalStorage('iE_eventLog').then((logs: logType[]) => {
      if (logs) {

        // toDO: get total money
        logs.forEach(log => {
          this.total += log.amount

          let found = false
          for (let key in this.workerLogs) {
            if (key == log.worker) {
              found = true
              this.workerLogs[log.worker].total += log.amount
              break
            }
          }

          if (!found) {
            this.workerLogs[log.worker] = { name: log.worker, total: 0 }
          }
        })

        for (let worker in this.workerLogs) {
          this.workerList.push({ name: worker, total: this.workerLogs[worker].total })
        }
      }

    })
  }

  close() {
    this.viewCtrl.dismiss();
    this.navCtrl.setRoot('IntroPage')
  }

  openAdmin(){
    this.viewCtrl.dismiss();
    this.navCtrl.setRoot('AdminPage')
  }
}
