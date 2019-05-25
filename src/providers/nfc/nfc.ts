import { Injectable, NgZone } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { global, encription, logType, currentPage } from '../global';
import { NFC, Ndef } from '@ionic-native/nfc';
import { DialogProvider } from '../dialog/dialog';
import { Events, AlertController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { AES256 } from '@ionic-native/aes-256';
import { StorageProvider } from '../storage/storage';
import { userRoleEnum, UserProvider } from '../user/user';
import { NetworkProvider } from '../network/network';
import { terminalEnum, DeviceProvider } from '../device/device';

export interface nfcCardType {
  cmdType: nfcCmdEnum,  // 2 characters
  id: string,
  balance: number,      // 6 characters
  maxsize: string,
  type: string,
  role: userRoleEnum       // 2 characters,
  cardOk: boolean,
  eventId: string,
  eventName: string,
  workerName?: string
}

export enum nfcCmdEnum { none, login, }

@Injectable()
export class NfcProvider {

  isNFC = false;
  isNFCwriting = false
  nfcSubscription: Subscription

  currentCard = {} as nfcCardType

  isAdminPage = false

  allNFCtransactions: logType[] = []


  constructor(
    private nfc: NFC,
    private dialogProv: DialogProvider,
    private event: Events,
    private ndef: Ndef,
    private afdb: AngularFireDatabase,
    private encrypt: AES256,
    private alertCtrl: AlertController,
    private storageProv: StorageProvider,
    private networkProv: NetworkProvider,
    private userProv: UserProvider,
    private deviceProv: DeviceProvider,


  ) {

  }

  subscribeNFC() {
    if (global.isDebug) {
      console.log('--NfcProvider-subscribeNFC')
    }

    this.nfc.enabled()
      .then(result => {
        console.log(result)

        if (result == 'NFC_OK') {
          let observable = this.nfc.addNdefListener(() => {
            this.isNFC = true
            console.log('NFC supported, NDEF listener started')
          },
            error => {
              console.log(error)
              console.log('Error attaching NDEF listener')
            })

          this.nfcSubscription = observable.subscribe(event => {
            // console.log(event.tag)
            // this.dialogProv.showLoading('Loading', 10000)
            this.onTagDetected()

            this.handleNFCread(event.tag)
          })
        }
        else {

        }
      })
      .catch(error => {
        console.log(error)

        if (this.deviceProv.terminalType != terminalEnum.none) {
          let alert = this.alertCtrl.create({
            title: 'Attention',
            subTitle: '',
            message: 'Vous devez activer le NFC pour le bon fonctionement de ce logiciel !!',
            buttons: [
              {
                text: 'Activer',
                handler: () => {
                  this.nfc.showSettings()
                }
              }
            ]
          });
          alert.present();
        }

      })

  }

  unsubscribeNFC() {
    if (global.isDebug) {
      console.log('--NfcProvider-unsubscribeNFC')
    }

    try {
      this.nfcSubscription.unsubscribe()

    } catch (error) {
      console.log(error)
    }
  }

  private handleNFCread(tag): Promise<any> {
    if (global.isDebug) {
      console.log('--NfcProvider-handleNFCread')
    }

    return new Promise((resolve, reject) => {

      this.currentCard.id = this.nfc.bytesToHexString(tag.id)
      this.currentCard.maxsize = tag.maxSize
      this.currentCard.type = tag.type
      this.currentCard.cardOk = false

      if (tag.ndefMessage) {
        let payload = tag.ndefMessage[0].payload

        this.unbuildNfcPayload(this.nfc.bytesToString(payload).substring(3))
          .then((res: nfcCardType) => {
            if (res.id != this.currentCard.id) {
              console.log('card manipulated')

              this.nfcReadPostAction()
              resolve()
            }
            else {
              this.currentCard.cardOk = true
              this.currentCard.cmdType = res.cmdType
              this.currentCard.role = res.role
              this.currentCard.balance = res.balance
              this.currentCard.workerName = res.workerName

              this.nfcReadPostAction()
              resolve()
            }
          })
          .catch(error => {
            console.log(error)
            console.log('card not ok')
            console.log(this.currentCard)
            this.nfcReadPostAction()
          })

      }
      else {
        this.nfcReadPostAction()
        console.log(this.currentCard)
      }
    });
  }

  private nfcReadPostAction() {
    if (global.isDebug) {
      console.log('--NfcProvider-nfcReadPostAction')
    }

    if (this.currentCard.cmdType == nfcCmdEnum.login && currentPage.name != 'superadmin' && currentPage.name != 'admin') {
      this.event.publish('iE-login', this.currentCard.role)
      this.userProv.currentWorkerCardId = this.currentCard.id
      this.userProv.currentWorker = this.currentCard.workerName

      this.currentCard.balance = null
    }
    else {
      this.event.publish('iE-nfc card connected')
      bluetooth.send({ msg: this.currentCard.balance })
    }

  }

  private writeNFC(msg): Promise<any> {
    if (global.isDebug) {
      console.log('--NfcProvider-writeNFC')
    }

    return new Promise((resolve, reject) => {

      let tag = [
        this.ndef.textRecord(msg),
        this.ndef.uriRecord("https://vihautech.net")
      ]

      this.nfc.write(tag)
        .then(result => {
          console.log('NFC writing result: ', result)
          this.isNFCwriting = false

          resolve()
        }, fail => {
          this.isNFCwriting = false
          console.log(fail)
          reject()
        })
        .catch(error => {
          console.log(error)
          this.isNFCwriting = false
        })
    });
  }

  getActivatedCardsObsvr(userID, eventID?) {
    if (global.isDebug) {
      console.log('--NfcProvider-getActivatedCardsObsvr')
    }

    if (eventID) return this.afdb.list(`activated-card/${userID}/${eventID}`).valueChanges()
    else return this.afdb.list(`activated-card/${userID}`).valueChanges()
  }

  activateCard(userID, eventID, card: nfcCardType): Promise<any> {
    if (global.isDebug) {
      console.log('--NfcProvider-activateCard')
    }

    return new Promise((resolve, reject) => {
      card.id = this.currentCard.id
      card.cardOk = this.currentCard.cardOk
      card.maxsize = this.currentCard.maxsize
      card.type = this.currentCard.type

      this.buildNfcPayload(card)
        .then(data => {
          this.writeNFC(data)
            .then(res => {
              this.currentCard = card
              this.currentCard.cardOk = true

              let id = this.afdb.createPushId()
              this.afdb.object(`activated-card/${userID}/${id}`).set({ cardId: card.id, eventId: eventID, id: id })
                .then(res => resolve())
                .catch(error => {
                  console.log('ERROR########')
                  console.log(error)
                })
            })
            .catch(error => reject(error))

        })
        .catch(error => reject('build nfc payload failed'))

    });
  }

  deactivateCard(userID, id): Promise<any> {
    if (global.isDebug) {
      console.log('--NfcProvider-deactivateCard')
    }

    return new Promise((resolve, reject) => {
      this.afdb.object(`activated-card/${userID}/${id}`).remove()
        .then(res => {
          resolve()
        },
          error => {
            reject(error)
          })
        .catch(error => reject(error))
    });
  }

  private buildNfcPayload(data: nfcCardType): Promise<any> {
    if (global.isDebug) {
      console.log('--NfcProvider-buildNfcPayload')
    }

    return new Promise((resolve, reject) => {
      // 0-1 -> cmd
      // 2-3 -> role
      // 4-9 -> balance
      // 10- && -> nfc card id
      // &&-&&  -> eventname
      // &&-&&  -> eventId
      // &&-&&  -> worker's name

      //cmdType + role + balance + id + eventName + eventId

      let cmdType = ''
      let payload = ''
      let role = ''

      if (data.cmdType <= 9) cmdType = `0${data.cmdType}`
      if (data.role <= 9) role = `0${data.role}`

      payload = cmdType + role + this.formatBalance(data.balance) + this.currentCard.id + '&&' + data.eventName + '&&' + data.eventId + '&&' + data.workerName
      console.log(payload)

      this.encrypt.encrypt(encription.key, encription.IV, payload)
        .then(pass => {
          console.log('encription passed')
          resolve(pass)
        }, fail => {
          console.log('enccription failed', fail)
          reject(fail)
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })

    });
  }

  private unbuildNfcPayload(payload): Promise<any> {
    if (global.isDebug) {
      console.log('--NfcProvider-unbuildNfcPayload')
    }

    return new Promise((resolve, reject) => {
      // 0-1 -> cmd
      // 2-3 -> role
      // 4-9 -> balance
      // 10- && -> nfc card id
      // &&-&&  -> eventname
      // &&-&&  -> eventId
      // &&-&&  -> worker's name

      //cmdType + role + balance + id + eventName + eventId + workerName

      this.encrypt.decrypt(encription.key, encription.IV, payload)
        .then(res => {
          let temp = res.substr(10).split('&&')

          let cardData: nfcCardType = {
            cmdType: parseInt(res.substr(0, 2)),
            role: parseInt(res.substr(2, 2)),
            balance: parseFloat(res.substr(4, 6)),
            id: temp[0],
            maxsize: '',
            type: '',
            cardOk: false,
            eventId: temp[2],
            eventName: temp[1],
            workerName: temp[3]
          }

          resolve(cardData)
        })
        .catch(error => {
          reject(error)
        })
    });
  }

  resetCurrentCard() {
    if (global.isDebug) {
      console.log('--NfcProvider-resetCurrentCard')
    }

    this.currentCard = {} as nfcCardType
  }

  writeCard(card: nfcCardType): Promise<any> {
    if (global.isDebug) {
      console.log('--NfcProvider-writeCard')
    }

    return new Promise((resolve, reject) => {
      card.id = this.currentCard.id
      card.cardOk = this.currentCard.cardOk
      card.maxsize = this.currentCard.maxsize
      card.type = this.currentCard.type

      this.buildNfcPayload(card)
        .then(data => {
          this.writeNFC(data)
            .then(pass => {
              this.currentCard = card
              this.currentCard.cardOk = true

              console.log('paylaod written', pass)
              resolve()

            }, fail => {
              console.log('payload not written', fail)
              reject()
            })
            .catch(error => {
              console.log(error)
              reject(error)
            })

        })
        .catch(error => {
          console.log(error)
          reject('build nfc payload failed')
        })

    });
  }

  formatBalance(balance: number) {
    if (global.isDebug) {
      console.log('--NfcProvider-formatBalance')
    }

    let out = ''
    let input = balance.toString()

    for (let i = 0; i < 6 - input.length; i++) {
      out += '0'
    }

    return out + balance.toString()
  }

  saveTransaction(transaction: logType) {
    if (global.isDebug) {
      console.log('--NfcProvider-saveTransaction')
    }

    this.allNFCtransactions.push(transaction)
    this.storageProv.setToLocalStorage('iE_eventLog', this.allNFCtransactions)

    if (this.networkProv.isOnline) {
      let statistics = this.getUserTotaltransaction()
      this.afdb.object(`users/${this.userProv.currentUser.id}/events/${this.userProv.currentEventID}/crew/${statistics.workerIndex}`)
        .update({ money: statistics.money, drinks: statistics.drinks })
        .catch(error => {
          this.networkProv.isOnline = false
          console.log(error)
        })
    }
  }

  getAllTransactions() {
    if (global.isDebug) {
      console.log('--NfcProvider-getAllTransactions')
    }

    this.storageProv.getFromLocalStorage('iE_eventLog').then(res => {
      if (res) this.allNFCtransactions = res
    })
  }

  onTagDetected() {
    this.currentCard = {
      id: '',
      cmdType: null,
      balance: null,
      maxsize: '',
      type: '',
      role: null,
      cardOk: false,
      eventId: '',
      eventName: ''
    }

    this.event.publish('iE-nfc card detected')

  }

  openNFCsettings() {
    this.nfc.showSettings()
  }

  getUserTotaltransaction() {
    let userIndex = null
    this.userProv.currentUser.events[this.userProv.currentEventID].crew.find((worker, index) => {
      userIndex = index
      return worker.name == this.userProv.currentWorker
    })

    let moneyTotal = 0
    let drinkTotal = {}

    this.allNFCtransactions.forEach(log => {
      if (log.worker == this.userProv.currentWorker) {

        // Fall Kassierer
        if (!log.note) {
          moneyTotal = moneyTotal + log.amount
        }
        else {
          if (Object.keys(drinkTotal).indexOf(log.note) > -1) {
            drinkTotal[log.note]++
          }
          else {
            drinkTotal[log.note] = 1
          }
        }
      }
    })

    let drinks = []
    for (let drink in drinkTotal) {
      drinks.push({ type: drink, total: drinkTotal[drink] })
    }

    return { money: moneyTotal, drinks: drinkTotal, workerIndex: userIndex }
  }
}

// let card: nfcCardType = {
//   id: '',
//   cmdType: this.nfcCard.role == userRoleEnum.client ? nfcCmdEnum.none : nfcCmdEnum.login,
//   balance: '000000',
//   maxsize: '',
//   type: '',
//   role: this.nfcCard.role,
//   cardOk: false,
//   eventId: this.selectedUserEventId,
//   eventName: this.selectedUser.events[this.selectedUserEventId].title
// }
