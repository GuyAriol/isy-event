import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, NavParams } from 'ionic-angular';
import { UserProvider, userRoleEnum } from '../../providers/user/user';
import { DialogProvider } from '../../providers/dialog/dialog';
import { NfcProvider, nfcCardType, nfcCmdEnum } from '../../providers/nfc/nfc';
import { currentPage } from '../../providers/global';

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
  drinksStatistics = {}

  constructor(
    public navCtrl: NavController,
    public userProv: UserProvider,
    private dialogProv: DialogProvider,
    private alertCtrl: AlertController,
    public nfcProv: NfcProvider,
    private navParams: NavParams


  ) {
    currentPage.name = 'admin'
    if (this.navParams.data) this.selectedUserEventId = navParams.data

  }

  ionViewDidEnter() {
    setTimeout(() => {
      try {
        this.eventPlaceholder = this.userProv.currentUser.events[this.selectedUserEventId].title
        this.getEventData()

      } catch (error) {

      }
    }, 1000);


  }

  ionViewDidLeave() {
    currentPage.name = ''
  }

  superAdmin() {
    this.navCtrl.setRoot('SuperadminPage')
  }

  close() {
    this.navCtrl.setRoot('InputPage', 0)
  }

  eventSelected(arg) {
    this.selectedUserEventId = arg
  }

  newCrewMember() {
    if (this.userProv.currentUser.events[this.selectedUserEventId].crew) {
      this.userProv.currentUser.events[this.selectedUserEventId].crew
        .push({ name: this.newCrew.name, role: this.newCrew.role })

      this.userProv.updateUser(this.userProv.currentUser)
    }
    else {
      this.userProv.currentUser.events[this.selectedUserEventId].crew =
        [{ name: this.newCrew.name, role: this.newCrew.role }]

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

  // toDo get data from all terminals only one at time
  getEventData() {
    if (this.selectedUserEventId) {
      this.dialogProv.showLoading('Loading', 10000)
      try {
        this.userProv.currentUser.events[this.selectedUserEventId].crew.forEach((worker, index) => {
          if (worker.role == 3) {

            this.drinksStatistics[index] = []

            for (let drink in worker.drinks) {
              this.drinksStatistics[index].push({ type: drink, total: worker.drinks[drink] })
            }
          }
        })

        this.drinksStatistics

      } catch (error) {
        console.log(error)
      }
    }

  }

}
