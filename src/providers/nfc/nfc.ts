import { Injectable } from '@angular/core';
import { NFC, Ndef } from '@ionic-native/nfc';
import { Subscription } from 'rxjs/Subscription';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { AES256 } from '@ionic-native/aes-256';
import { encription, global } from '../../providers/global';
import { Events } from 'ionic-angular';


export interface nfcType {
  cmdType: nfcCmdEnum,  // 2 characters
  id: string,
  balance: string,      // 6 characters
  maxsize: string,
  type: string,
  role: userRole       // 2 characters,
  cardOk: boolean
}

export enum nfcCmdEnum {none, login, }
export enum userRole { admin, entranceTicket, drinks, barman, superadmin, owner, client }


@Injectable()
export class NfcProvider {

  isNFC = false; isNFCwriting = false
  nfcSubscription: Subscription

  currentCard = {} as nfcType
  currentUser = {} as nfcType

  constructor(
    private nfc: NFC,
    private ndef: Ndef,
    private afdb: AngularFireDatabase,
    private encrypt: AES256,
    private event: Events,


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
            console.log(event)
            this.handleNFCread(event.tag)
          })
        }
      })
      .catch(error => {
        console.log(error)
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
          .then((res: nfcType) => {
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
          })

      }
      else {
        this.nfcReadPostAction()
      }
    });
  }

  nfcReadPostAction() {
    if (global.isDebug) {
      console.log('--NfcProvider-nfcReadPostAction')
    }

    if (this.currentCard.cmdType == nfcCmdEnum.login) this.event.publish('login', this.currentCard.role)
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
          console.log(result)
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


  resetActivatedCards(userID, eventID): Promise<any> {
    return new Promise((resolve, reject) => {
      this.afdb.object(`activated-card/${userID}/${eventID}`).remove()
        .then(() => resolve())
        .catch(error => reject(error))
    });
  }

  getActivatedCardsObsvr(userID, eventID) {
    return <Observable<nfcType[]>>this.afdb.list(`activated-card/${userID}/${eventID}`).valueChanges()
  }

  activateCard(userID, eventID): Promise<any> {
    return new Promise((resolve, reject) => {
      this.afdb.list(`activated-card/${userID}/${eventID}`)
    });
  }

  resetCard(): Promise<any> {
    return new Promise((resolve, reject) => {

    });
  }

  buildNfcPayload(data: nfcType): Promise<any> {
    if (global.isDebug) {
      console.log('--NfcProvider-buildNfcPayload')
    }

    return new Promise((resolve, reject) => {
      // 0-1 -> cmd
      // 2-3 -> role
      // 4-9 -> balance

      //cmdType + role + balance + id

      let cmdType = ''
      let payload = ''
      let role = ''

      if (data.cmdType <= 9) cmdType = `0${data.cmdType}`
      if (data.role <= 9) role = `0${data.role}`

      payload = cmdType + role + data.balance + this.currentCard.id
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

      //cmdType + role + balance + id

      this.encrypt.decrypt(encription.key, encription.IV, payload)
        .then(res => {
          let cardData: nfcType = {
            cmdType: parseInt(res.substr(0, 2)),
            role: parseInt(res.substr(2, 2)),
            balance: res.substr(4, 6),
            id: res.substr(10),
            maxsize: '',
            type: '',
            cardOk: false
          }

          resolve(cardData)
        })
        .catch(error => {
          reject(error)
        })
    });
  }
}
