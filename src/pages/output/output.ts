import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, ViewController, PopoverController, Events } from 'ionic-angular';
import { NfcProvider, nfcCardType, nfcCmdEnum } from '../../providers/nfc/nfc';
import { BluetoothProvider } from '../../providers/bluetooth/bluetooth';
import { userRoleEnum, UserProvider } from '../../providers/user/user';
import { logType } from '../../providers/global';
import { DeviceProvider } from '../../providers/device/device';
import { StorageProvider } from '../../providers/storage/storage';
import { DialogProvider } from '../../providers/dialog/dialog';
import { PricingProvider } from '../../providers/pricing/pricing';
import { TerminalPopover } from '../terminal-popover/TerminalPopover';

@IonicPage()
@Component({
  selector: 'page-output',
  templateUrl: 'output.html',
})
export class OutputPage {

  onGoing = false
  statusMsg = 'Device ready! OK'

  isMenuDevice = false

  constructor(
    public navCtrl: NavController,
    private nfcProv: NfcProvider,
    public bluetoothProv: BluetoothProvider,
    public userProv: UserProvider,
    public deviceProv: DeviceProvider,
    public popoverCtrl: PopoverController,
    private dialogProv: DialogProvider,
    private event: Events,
    public pricingProv: PricingProvider,
    private ngzone: NgZone


  ) {

  }

  ionViewDidEnter() {
    if (!Object.keys(this.bluetoothProv.connectedDevice).length) this.statusMsg = 'The display is not connected !!'

    this.event.subscribe('iE-bluetooth connection', () => {
      this.ngzone.run(() => {
        this.onGoing = false
        this.statusMsg = 'Device ready. OK'
        console.log('on connect')
      })
    })

    this.event.subscribe('iE-bluetooth disconnection', () => {
      this.ngzone.run(() => {
        setTimeout(() => {
          this.onGoing = true
          this.statusMsg = "The display is not connected !!"
          console.log('on disconnect')
        }, 1000);
      })
    })

    this.event.subscribe('iE-nfc card connected', () => {
      this.ngzone.run(() => {
        this.onGoing = false
        this.statusMsg = `Balance: ${this.nfcProv.currentCard.balance} euro, OK`
        console.log('output page, card connected')
      })
    })

    this.event.subscribe('iE-nfc card detected', () => {
      this.ngzone.run(() => {
        this.onGoing = true
        this.statusMsg = 'Reading card ...'
        console.log('on card detected')
      })
    })
  }

  ionViewWillLeave() {
    this.event.unsubscribe('iE-bluetooth connection')
    this.event.unsubscribe('iE-nfc card connected')
    this.event.unsubscribe('iE-bluetooth disconnection')
  }

  book(price: string, item: string) {
    this.onGoing = true
    this.statusMsg = 'Loading ...'

    let priceN = parseFloat(price)

    if (this.nfcProv.currentCard.balance == null) {
      this.onGoing = false
      this.statusMsg = 'Error! Check the card and try again.'
    }
    else {
      if (priceN <= this.nfcProv.currentCard.balance) {
        let card: nfcCardType = {
          id: '',
          cmdType: nfcCmdEnum.none,
          balance: this.nfcProv.currentCard.balance - parseFloat(price),
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

            let log: logType = {
              timeStamp: Date.now(),
              worker: this.userProv.currentWorker,
              amount: priceN,
              note: item,
              workerId: this.userProv.currentWorkerCardId
            }
            this.nfcProv.saveTransaction(log)

            this.onGoing = false
            this.statusMsg = 'OK. New balance ' + this.nfcProv.currentCard.balance + ' euro'
          },
            fail => {
              this.onGoing = false
              this.statusMsg = 'Error! Check the card and try again.'
            })
          .catch(error => {
            this.onGoing = false
            this.statusMsg = 'Error! Please try again'
          })
      }
      else {
        this.onGoing = false
        this.statusMsg = `insufficient balance !! Balance:  ${this.nfcProv.currentCard.balance} euro `
      }
    }
  }

  logOff(event) {
    let popover = this.popoverCtrl.create(TerminalPopover, { data: 'bar' })
    popover.present({ ev: event })
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

          for (let deviceKey in devices) {
            this.bluetoothProv.pairedDevices.push(devices[deviceKey])
          }

        })
      }
    }
  }

  // toDo: move to bluetooth provider
  connectPairedDevice(deviceAddress) {
    this.dialogProv.showLoading('Connecting', 10000)

    bluetooth.stopScan()
    bluetooth.connect({ address: deviceAddress })
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

class PopoverPage {

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
