import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController, ViewController, Events, AlertController, ModalController } from 'ionic-angular';
import { DeviceProvider } from '../../providers/device/device';
import { BluetoothProvider } from '../../providers/bluetooth/bluetooth';
import { DialogProvider } from '../../providers/dialog/dialog';
import { NfcProvider, nfcCardType, nfcCmdEnum } from '../../providers/nfc/nfc';
import { UserProvider, userRoleEnum } from '../../providers/user/user';
import { StorageProvider } from '../../providers/storage/storage';
import { logType } from '../../providers/global';
import { TerminalPopover } from '../terminal-popover/TerminalPopover';

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
  message = ''

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
    private alertCrl: AlertController,
    private modalCtrl: ModalController


  ) {

  }

  ionViewDidEnter() {
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
        this.message = ''
        console.log('card connected')
      })
    })
  }

  ionViewWillLeave() {
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
            workerId: this.userProv.currentWorkerCardId,
            takeIn: 0,
            takeOut: 0
          }
          this.nfcProv.saveTransaction(log)

          this.input = ''

        },
          fail => {
            this.state = stateEnum.fail
            this.color = 'red'

            // this.dialogProv.showToast('Error! Check the card.')
            this.message = 'Error! Check the card.'
            bluetooth.send({ msg: this.nfcProv.currentCard.balance + "&&red" })
          })
        .catch(error => {
          this.state = stateEnum.error
          this.color = 'red'
          console.log(error)
        })
    }
    else {
      // this.dialogProv.showToast('Error! Check the amount.')
      this.message = 'Error! Check the amount.'
      this.state = stateEnum.ongoing
      this.color = 'goldenrod'
    }
  }

  removeMoney() {
    this.userProv.evaluateEventData().then(result => {
      if (this.input) {
        if (result.workerObject[this.userProv.currentWorkerCardId].totalCash > parseFloat(this.input)) {
          if (this.nfcProv.currentCard.balance == null) {
            // this.dialogProv.showToast('Error! Check the card')
            this.message = 'Error! Check the card'
          }
          else {
            if (parseFloat(this.input) > this.nfcProv.currentCard.balance)
              // this.dialogProv.showToast(`You cannot cash out more than ${this.nfcProv.currentCard.balance} euro`)
              this.message = `You cannot cash out more than ${this.nfcProv.currentCard.balance} euro`
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
                    workerId: this.userProv.currentWorkerCardId,
                    takeIn: 0,
                    takeOut: 0
                  }
                  this.nfcProv.saveTransaction(log)

                  this.input = ''

                },
                  fail => {
                    this.state = stateEnum.fail
                    this.color = 'red'

                    // this.dialogProv.showToast('Error! Check the card')
                    this.message = 'Error! Check the card'
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
          // this.dialogProv.showSimpleDialog('Error', '', 'There is not enough cash in the box', 'Ok')
          this.message = 'There is not enough cash in the box'
        }

      }
      else {
        // this.dialogProv.showToast('Error! Enter the amount to be cashed out.')
        this.message = 'Error! Enter the amount to be cashed out.'
      }
    })
  }

  logOff(event) {
    let popover = this.popoverCtrl.create(TerminalPopover, { data: 'cash' })
    popover.present({ ev: event })
  }

  openDlg(arg) {
    let title = ''
    let msg = ''
    let type = ''

    if (arg == 'in') {
      title = 'Filling cash box'
      msg = 'Take money into the cash box i.e. change'
      type = 'takeIn'
    }
    else if (arg == 'out') {
      title = 'Reduce cash box'
      msg = 'Take out money out of cash box'
      type = 'takeOut'
    }

    this.modalCtrl.create('ModalPage', {
      title:title, msg: msg, type:type
    }, {cssClass: 'my-modal-inner my-stretch'}).present()

  }
}

