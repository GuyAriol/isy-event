import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { global, encription } from '../global';
import { NFC, Ndef } from '@ionic-native/nfc';
import { DialogProvider } from '../dialog/dialog';
import { Events, AlertController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { AES256 } from '@ionic-native/aes-256';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';

export interface nfcCardType {
  cmdType: nfcCmdEnum,  // 2 characters
  id: string,
  balance: string,      // 6 characters
  maxsize: string,
  type: string,
  role: userRoleEnum       // 2 characters,
  cardOk: boolean,
  eventId: string,
  eventName: string
}

export enum nfcCmdEnum { none, login, }

export enum userRoleEnum { admin, entranceTicket, drinks, barman, superadmin, owner, client }


@Injectable()
export class NfcProvider {

  isNFC = false;
  isNFCwriting = false
  nfcSubscription: Subscription

  currentCard = {} as nfcCardType
  currentUser = {} as nfcCardType

  isAdminPage = false
  isCardPresent = false

  constructor(
    private nfc: NFC,
    private dialogProv: DialogProvider,
    private event: Events,
    private ndef: Ndef,
    private afdb: AngularFireDatabase,
    private encrypt: AES256,
    private alertCtrl: AlertController,
    private openNativeSettings: OpenNativeSettings


  ) {

  }


  subscribeNFC() {
    if (global.isDebug) {
      console.log('--NfcProvider-subscribeNFC')
    }

    this.nfc.enabled()
      .then(result => {

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
            this.dialogProv.showLoading('Loading', 10000)
            this.handleNFCread(event.tag)
          })
        }
        else {

        }
      })
      .catch(error => {
        console.log(error)

        let alert = this.alertCtrl.create({
          title: 'Attention',
          subTitle: '',
          message: 'Vous devez activer le NFC pour le bon fonctionement de ce logiciel !!',
          buttons: [
            {
              text: 'Activer',
              handler: () => {
                this.openNativeSettings.open("nfc_settings")
              }
            }
          ]
        });
        alert.present();
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
              console.log('card Ok')
              this.currentCard.cardOk = true
              this.currentCard.cmdType = res.cmdType
              this.currentCard.role = res.role
              this.currentCard.balance = res.balance

              console.log(this.currentCard)
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


    if (this.currentCard.cmdType == nfcCmdEnum.login) this.event.publish('login', this.currentCard.role)
    else {
      this.isCardPresent = true
    }

    this.dialogProv.dismissLoading()
  }

  writeNFC(msg): Promise<any> {
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
        }, error => {
          this.isNFCwriting = false
          console.log(error)
          reject()
        })
        .catch(error => {
          console.log(error)
          this.isNFCwriting = false
        })
    });
  }

  getActivatedCardsObsvr(userID, eventID?) {
    if (eventID) return this.afdb.list(`activated-card/${userID}/${eventID}`).valueChanges()
    else return this.afdb.list(`activated-card/${userID}`).valueChanges()
  }

  activateCard(userID, eventID, card: nfcCardType): Promise<any> {
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

  buildNfcPayload(data: nfcCardType): Promise<any> {
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

      //cmdType + role + balance + id + eventName + eventId

      let cmdType = ''
      let payload = ''
      let role = ''

      if (data.cmdType <= 9) cmdType = `0${data.cmdType}`
      if (data.role <= 9) role = `0${data.role}`

      payload = cmdType + role + data.balance + this.currentCard.id+ '&&' + data.eventName +'&&' +data.eventId
      console.log(payload)

      this.encrypt.encrypt(encription.key, encription.IV, payload)
        .then(res => {
          console.log(res)
          resolve(res)
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })

    });
  }

  unbuildNfcPayload(payload): Promise<any> {
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

      //cmdType + role + balance + id + eventName + eventId

      this.encrypt.decrypt(encription.key, encription.IV, payload)
        .then(res => {
          let temp = res.substr(10).split('&&')

          let cardData: nfcCardType = {
            cmdType: parseInt(res.substr(0, 2)),
            role: parseInt(res.substr(2, 2)),
            balance: res.substr(4, 6),
            id: temp[0],
            maxsize: '',
            type: '',
            cardOk: false,
            eventId: temp[2],
            eventName: temp[1]
          }

          if(cardData.balance == '000000') cardData.balance = '0'
          console.log(cardData)

          resolve(cardData)
        })
        .catch(error => {
          reject(error)
        })
    });
  }

  resetCurrentCard(){
    this.currentCard = {} as nfcCardType
  }
}
