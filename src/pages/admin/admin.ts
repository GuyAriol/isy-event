import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController } from 'ionic-angular';
import { UserProvider, userRoleEnum } from '../../providers/user/user';
import { DialogProvider } from '../../providers/dialog/dialog';
import { NfcProvider, nfcCardType, nfcCmdEnum } from '../../providers/nfc/nfc';

@IonicPage()
@Component({
  selector: 'page-admin',
  templateUrl: 'admin.html',
})
export class AdminPage {

  selectedUserEventIds = []
  selectedUserEventId = ''
  crew = {}

  isNewCrew = false
  newCrew = { name: '', role: userRoleEnum.drinks }

  constructor(
    public navCtrl: NavController,
    public userProv: UserProvider,
    private dialogProv: DialogProvider,
    private alertCtrl: AlertController,
    public nfcProv: NfcProvider


  ) {
  }

  ngOnInit() {
    this.dialogProv.showLoading('loading ...', 10000)

    setTimeout(() => {
      this.userProv.subscribeUser(this.userProv.currentUser.id)

      try {
        this.selectedUserEventIds = Object.keys(this.userProv.currentUser.events)
        console.log(this.selectedUserEventIds)
      } catch (error) {
        this.selectedUserEventIds = []
      }

      this.dialogProv.dismissLoading()
    }, 2000);

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
      title: 'Activer carte pour CREW',
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
            this.dialogProv.showLoading('En cours ...', 120000)

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
              })
              .catch(error => {
                console.log(error)
              })
          }
        }
      ]
    }).present();
  }

  ongoing() {
    this.dialogProv.showToast('En développement ...')
  }

  write_test(arg) {
    let card: nfcCardType = {
      id: '',
      cmdType: nfcCmdEnum.none,
      balance: parseFloat(arg) + this.nfcProv.currentCard.balance,
      maxsize: '',
      type: '',
      role: userRoleEnum.client,
      cardOk: false,
      eventId: this.userProv.currentEventID,
      eventName: this.userProv.currentUser.events[this.userProv.currentEventID].title,
      workerName: ' '
    }

    this.nfcProv.writeCard(card)
      .then(res => {
        console.log('res')
      }, fail => {
        console.log(fail)
      })
      .catch(error => {
        console.log(error)
      })
  }
}
