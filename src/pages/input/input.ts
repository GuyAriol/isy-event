import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController, ViewController, Events } from 'ionic-angular';
import { DeviceProvider } from '../../providers/device/device';
import { BluetoothProvider } from '../../providers/bluetooth/bluetooth';
import { DialogProvider } from '../../providers/dialog/dialog';
import { NfcProvider, nfcCardType, nfcCmdEnum } from '../../providers/nfc/nfc';
import { UserProvider, userRoleEnum } from '../../providers/user/user';
import { StorageProvider } from '../../providers/storage/storage';
import { logType } from '../../providers/global';

enum stateEnum { ongoing, pass, fail, error }

@IonicPage()
@Component({
  selector: 'page-input',
  templateUrl: 'input.html',
})
export class InputPage {

  isMenuDevice = false
  input: string = ''

  state: stateEnum = stateEnum.ongoing
  color = 'grey'

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public deviceProv: DeviceProvider,
    public bluetoothProv: BluetoothProvider,
    private dialogProv: DialogProvider,
    public nfcProv: NfcProvider,
    public popoverCtrl: PopoverController,
    public userProv: UserProvider,
    private event: Events,
    private ngZone: NgZone,


  ) {
    // if (Object.keys(navParams.data).length) this.deviceProv.terminalType = navParams.data

  }

  ionViewDidLoad() {
    this.event.subscribe('iE-nfc card detected', () => {

      this.ngZone.run(() => {
        this.state = stateEnum.ongoing
        this.color = 'grey'
        console.log('on card detected')
      })
    })

    this.event.subscribe('iE-nfc card connected', () => {
      this.ngZone.run(() => {
        this.state = stateEnum.pass
        this.color = 'green'
        console.log('card connected')
      })
    })
  }

  ionViewDidLeave() {
    this.event.unsubscribe('iE-nfc card detected')
    this.event.unsubscribe('iE-nfc card connected')
  }

  // toDo: move to bluetooth provider
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

  // toDo: move to bluetooth provider
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
    console.log(this.input)

    // if (this.nfcProv.currentCard) {
    if (this.input) {
      this.state = stateEnum.ongoing
      this.color = 'grey'

      let card: nfcCardType = {
        id: '',
        cmdType: nfcCmdEnum.none,
        balance: parseFloat(this.input) + this.nfcProv.currentCard.balance,
        maxsize: '',
        type: '',
        role: userRoleEnum.client,
        cardOk: false,
        eventId: this.userProv.currentEventID,
        eventName: this.userProv.currentUser.events[this.userProv.currentEventID].title,
        workerName: ' '
      }

      this.nfcProv.writeCard(card)
        .then(pass => {

          bluetooth.send({ msg: this.nfcProv.currentCard.balance })

          this.state = stateEnum.pass
          this.color = 'green'

          let log: logType = {
            timeStamp: Date.now(),
            worker: this.userProv.currentWorker,
            amount: parseFloat(this.input),
            note: '',
            workerId: this.userProv.currentWorkerCardId
          }
          this.nfcProv.saveTransaction(log)

          this.input = ''

        },
          fail => {
            this.state = stateEnum.fail
            this.color = 'red'

            this.dialogProv.showToast('Error! Check the card.')
          })
        .catch(error => {
          this.state = stateEnum.error
          this.color = 'red'
          console.log(error)
        })
    }
    else {
      this.dialogProv.showToast('Error! Check the amount.')
      this.state = stateEnum.ongoing
      this.color = 'goldenrod'
    }
    // }
    // else {
    //   this.dialogProv.showToast('Vérifiez la carte')
    //   this.state = stateEnum.fail
    //   this.color = 'red'
    // }

  }

  removeMoney() {
    if (this.input) {
      if (this.nfcProv.currentCard.balance == null) {
        this.dialogProv.showToast('Error! Check the card')
      }
      else {
        if (parseFloat(this.input) > this.nfcProv.currentCard.balance) this.dialogProv
          .showToast(`You cannot cash out more than ${this.nfcProv.currentCard.balance} euro`)
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

          this.nfcProv.writeCard(card)
            .then(pass => {

              bluetooth.send({ msg: this.nfcProv.currentCard.balance })

              this.state = stateEnum.pass
              this.color = 'green'

              let log: logType = {
                timeStamp: Date.now(),
                worker: this.userProv.currentWorker,
                amount: -parseFloat(this.input),
                note: '',
                workerId: this.userProv.currentWorkerCardId
              }
              this.nfcProv.saveTransaction(log)

              this.input = ''

            },
              fail => {
                this.state = stateEnum.fail
                this.color = 'red'

                this.dialogProv.showToast('Error! Check the card')
              })
            .catch(error => {
              this.state = stateEnum.error
              this.color = 'red'
              console.log(error)
            })
        }
      }
    }
    else {
      this.dialogProv.showToast('Error! Enter the amount to be cashed out.')
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
      <ion-list-header>{{userProv.currentWorker}}</ion-list-header>
      <ion-item>
        <ion-label>Total caise: {{total}} euro</ion-label>
      </ion-item>

      <div *ngFor="let worker of workerList">
        <ion-item>
          <p><b>{{worker.name}}</b></p>
          <p>{{worker.total}} euro</p>
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
    public nfcProv: NfcProvider,
    public userProv: UserProvider

  ) {
    this.storageProv.getFromLocalStorage('iE_eventLog').then((logs: logType[]) => {
      if (logs) {

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
            this.workerLogs[log.worker] = { name: log.worker, total: log.amount }
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

  openAdmin() {
    this.viewCtrl.dismiss();
    this.navCtrl.setRoot('AdminPage')
  }
}
