import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, NavParams } from 'ionic-angular';
import { UserProvider, userRoleEnum, workerType } from '../../providers/user/user';
import { DialogProvider } from '../../providers/dialog/dialog';
import { NfcProvider, nfcCardType, nfcCmdEnum } from '../../providers/nfc/nfc';
import { currentPage } from '../../providers/global';
import { DeviceProvider, terminalEnum } from '../../providers/device/device';

@IonicPage()
@Component({
  selector: 'page-admin',
  templateUrl: 'admin.html',
})
export class AdminPage {

  selectedUserEventId = ''
  crew = {}
  eventPlaceholder = ''

  isNewCrew = false
  newCrew = { name: '', role: userRoleEnum.drinks }

  isStats = false
  isCompile = false
  isCrew = false
  isBeforeEvent = false
  ispricing = false

  constructor(
    public navCtrl: NavController,
    public userProv: UserProvider,
    private dialogProv: DialogProvider,
    private alertCtrl: AlertController,
    public nfcProv: NfcProvider,
    private navParams: NavParams,
    private deviceProv: DeviceProvider,


  ) {
    currentPage.name = 'admin'
    if (Object.keys(this.navParams.data).length) this.selectedUserEventId = navParams.data
    if (this.selectedUserEventId) this.userProv.compileEventData(this.selectedUserEventId)
  }

  ionViewDidEnter() {
    setTimeout(() => {
      try {
        this.eventPlaceholder = this.userProv.currentUser.events[this.selectedUserEventId].title
        this.userProv.currentEventID = this.selectedUserEventId

      } catch (error) {

      }
    }, 1000);

  }

  ionViewDidLeave() {
    currentPage.name = ''
  }

  superAdmin() {
    // this.navCtrl.setRoot('SuperadminPage')
  }

  close() {
    if (this.deviceProv.terminalType == terminalEnum.none) this.navCtrl.setRoot('IntroPage', 0)
    else this.navCtrl.setRoot('InputPage', 0)
  }

  eventSelected(arg) {
    this.selectedUserEventId = arg
    this.userProv.currentEventID = arg
    this.userProv.compileEventData(arg)
  }

  newCrewMember() {
    // toDo: update missing properties
    if (this.userProv.currentUser.events[this.selectedUserEventId].crew) {
      let temp: workerType = {
        name: this.newCrew.name, role: this.newCrew.role, money: 0, moneyBegin: 0, drinks: {}, moneyOut: 0, moneyIn: 0
      }

      this.userProv.currentUser.events[this.selectedUserEventId].crew.push(temp)

      this.userProv.updateUser(this.userProv.currentUser)
    }
    else {
      let temp: workerType = {
        name: this.newCrew.name, role: this.newCrew.role, money: 0, moneyBegin: 0, drinks: {}, moneyOut: 0, moneyIn: 0
      }

      this.userProv.currentUser.events[this.selectedUserEventId].crew = [temp]

      this.userProv.updateUser(this.userProv.currentUser)
    }
  }

  deleteCrewMember(index) {
    this.userProv.currentUser.events[this.selectedUserEventId].crew.splice(index, 1)
    this.userProv.updateUser(this.userProv.currentUser)
  }

  writeCard(crewMember) {
    this.alertCtrl.create({
      title: 'Activer carte pour ' + crewMember.name,
      subTitle: '',
      message: 'Rapprocher la carte du terminal et valider ensuite.',
      buttons: [
        {
          text: 'Annuler',
          handler: () => {

          }
        },
        {
          text: 'Valider',
          handler: () => {
            if (this.nfcProv.isNFC) {
              this.dialogProv.showLoading('En cours ...', 30000)

              let card: nfcCardType = {
                id: '',
                cmdType: nfcCmdEnum.login,
                balance: 0,
                maxsize: '',
                type: '',
                role: crewMember.role,
                cardOk: false,
                eventId: this.selectedUserEventId,
                eventName: this.userProv.currentUser.events[this.selectedUserEventId].title,
                workerName: crewMember.name
              }

              this.nfcProv.writeCard(card)
                .then(res => {
                  this.dialogProv.dismissLoading()
                  this.dialogProv.showToast('Action réussie', null, null, 'success')
                })
                .catch(error => {
                  this.dialogProv.dismissLoading()
                  console.log(error)
                })
            }
            else {
              this.alertCtrl.create(
                {
                  title: 'NFC déactivé !!',
                  message: 'Vous devez activer le NFC pour continuer',
                  buttons: [
                    { text: 'Annuler' },
                    {
                      text: 'Activer',
                      handler: () => {
                        this.nfcProv.openNFCsettings()
                      }
                    }
                  ]
                }
              ).present()
            }

          }
        }
      ]
    }).present();
  }

  ongoing() {
    this.dialogProv.showToast('En développement ...')
  }

  uploadBeginData() {
    this.userProv.currentUser.events[this.selectedUserEventId].crew.forEach(worker => {
      worker.moneyBegin = parseFloat(worker.moneyBegin.toString())
    })

    for (let drink in this.userProv.currentUser.events[this.selectedUserEventId].drinksBegin) {
      this.userProv.currentUser.events[this.selectedUserEventId].drinksBegin[drink] =
        parseFloat(this.userProv.currentUser.events[this.selectedUserEventId].drinksBegin[drink])
    }

    this.userProv.updateUser(this.userProv.currentUser)
    this.isBeforeEvent = false
    this.dialogProv.showToast('Done', 2000, null, 'success')
  }

  uploadPricing() {
    this.userProv.currentUser.events[this.selectedUserEventId].pricing.forEach(price => {
      price.name = price.name.split('-')[0].trim() + ' - ' + price.price + ' euro'
    })

    this.userProv.updateUser(this.userProv.currentUser)
    this.ispricing = false
    this.dialogProv.showToast('Done', 2000, null, 'success')
  }

  uploadEventData() {
    this.userProv.currentUser.events[this.selectedUserEventId].crew.forEach((worker: workerType) => {
      if (worker.role == userRoleEnum.drinks) {
        worker.moneyIn = parseFloat(worker.moneyIn.toString())
        worker.moneyOut = parseFloat(worker.moneyOut.toString())
        worker.money = worker.moneyIn + worker.moneyBegin - worker.moneyOut
      }
      else if (worker.role == userRoleEnum.barman) {
        for (let drink in worker.drinks) {
          worker.drinks[drink] = parseFloat(worker.drinks[drink].toString())
        }
      }

    })

    this.userProv.updateUser(this.userProv.currentUser)
    this.isCompile = false
    this.dialogProv.showToast('Done', 2000, null, 'success')
  }

  getDrinksBeginList() {
    let out = []

    for (let drink in this.userProv.currentUser.events[this.selectedUserEventId].drinksBegin) {
      out.push({ name: drink, value: this.userProv.currentUser.events[this.selectedUserEventId].drinksBegin[drink] })
    }

    return out
  }

  test() {
    this.userProv.test()
  }
}
