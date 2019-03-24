import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserProvider, userType, eventType } from '../../providers/user/user';
import { Observable } from 'rxjs/Observable';
import { nfcType, NfcProvider, userRole } from '../../providers/nfc/nfc';
import { DialogProvider } from '../../providers/dialog/dialog';

@IonicPage()
@Component({
  selector: 'page-super-admin',
  templateUrl: 'super-admin.html',
})
export class SuperAdminPage {

  allusers: Observable<userType[]>
  nfcCard = {} as nfcType

  selectedUser: userType = null
  selectedUserCard$: Observable<nfcType[]>
  selectedUserEventsId = []

  isNewUser = false
  isNewEvent = false

  credentials = {} as { email: string, password: string, name }
  newEvent = {} as eventType

  constructor(

    public navCtrl: NavController,
    public userProv: UserProvider,
    private nfcProv: NfcProvider,
    private dialogProv: DialogProvider,


  ) {
  }

  ionViewDidEnter() {
    this.allusers = this.userProv.getAllUsersObsvr()
  }

  clientSelected(arg) {
    this.selectedUser = arg
    try {
      this.selectedUserEventsId = Object.keys(this.selectedUser.events)
    } catch (error) {
      this.selectedUserEventsId = []
    }

  }

  eventSelected() {

  }

  activateCard() {
    if (this.nfcCard.role == userRole.entranceTicket) console.log('ok')
  }

  createNewEvent() {
    if (!this.selectedUser.id) this.dialogProv.showToast('Selection un client')
    else if (!this.newEvent.title) this.dialogProv.showToast('Donner un titre')
    else {
      this.dialogProv.showLoading('En cours', 120000)
      this.userProv.createNewEvent(this.newEvent, this.selectedUser.id)
        .then(() => {
          this.dialogProv.dismissLoading()
          this.isNewEvent = false
          this.newEvent = { title: '', location: '', date: '', id: '' }
          this.dialogProv.showToast('Done')
        })
        .catch(error => {
          console.log(error)
          this.dialogProv.dismissLoading()
        })
    }
  }

  createNewUser() {
    this.dialogProv.showLoading('Creating user', 150000)

    if (!this.credentials.email || !this.credentials.name || !this.credentials.password) {
      this.dialogProv.showToast('Please fill the form')
      this.dialogProv.dismissLoading()
    }
    else {
      this.userProv.signUp(this.credentials)
        .then(res => {
          this.dialogProv.dismissLoading()
          this.credentials = { name: '', email: '', password: '' }
          this.isNewUser = false
          this.dialogProv.showToast('Done')
        })
        .catch(error => {
          this.dialogProv.dismissLoading()
          this.dialogProv.authentificationErrorDlg(error, 'Créer client')
        })
    }
  }
}
