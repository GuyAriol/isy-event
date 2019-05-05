import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DeviceProvider } from '../../providers/device/device';
import { BluetoothProvider } from '../../providers/bluetooth/bluetooth';
import { NfcProvider, nfcCardType, nfcCmdEnum } from '../../providers/nfc/nfc';
import { DialogProvider } from '../../providers/dialog/dialog';
import { UserProvider, eventType, userType, userRoleEnum } from '../../providers/user/user';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

@IonicPage()
@Component({
  selector: 'page-superadmin',
  templateUrl: 'superadmin.html',
})
export class SuperadminPage {

  input = ''    // terminal || display
  allUserSubscription: Subscription
  userCardsSubscription: Subscription
  nfcCard = {} as nfcCardType

  selectedUser: userType = null
  selectedUserCard$: Observable<nfcCardType[]>
  selectedUserEventIds = []
  selectedUserEventId = ''

  isNewUser = false
  isNewEvent = false
  isSearch = false

  credentials = {} as { email: string, password: string, name: string, adminPass: string }
  newEvent = {} as eventType

  searchList: userType[] = []
  userList: userType[] = []
  userCards: { cardId: string, eventId: string, id: string }[] = []

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public deviceProv: DeviceProvider,
    public bluetoothProv: BluetoothProvider,
    public userProv: UserProvider,
    public nfcProv: NfcProvider,
    private dialogProv: DialogProvider,

  ) {
    this.nfcCard.role = userRoleEnum.superadmin
  }

  ionViewDidLoad() {
    this.allUserSubscription = this.userProv.getAllUsersObsvr().subscribe(users => {
      this.userList = users
      this.searchList = users
    })
  }

  ionViewDidLeave() {
    this.userList = []
    this.searchList = []

    try {
      this.allUserSubscription.unsubscribe()
    } catch (error) {
    }

    try {
      this.userCardsSubscription.unsubscribe()
    } catch (error) {

    }
  }

  clientSelected(arg) {
    console.log(arg)
    this.selectedUser = arg
    this.isSearch = false
    this.nfcProv.isAdminPage = true

    try {
      this.selectedUserEventIds = Object.keys(this.selectedUser.events)
    } catch (error) {
      this.selectedUserEventIds = []
    }

    this.userCardsSubscription = this.nfcProv.getActivatedCardsObsvr(this.selectedUser.id).subscribe((res: { id: string, eventId: string, cardId: string }[]) => {
      this.userCards = res
    })
  }

  eventSelected(arg) {
    this.selectedUserEventId = arg
  }

  activateCard() {
    this.dialogProv.showLoading('En cours ...', 30000)

    let card: nfcCardType = {
      id: '',
      cmdType: this.nfcCard.role == userRoleEnum.client ? nfcCmdEnum.none : nfcCmdEnum.login,
      balance: 0,
      maxsize: '',
      type: '',
      role: this.nfcCard.role,
      cardOk: false,
      eventId: this.selectedUserEventId,
      eventName: this.selectedUser.events[this.selectedUserEventId].title,
      workerName: ' '
    }

    this.nfcProv.activateCard(this.selectedUser.id, this.selectedUserEventId, card)
      .then(res => {
        this.dialogProv.dismissLoading()
      })
      .catch(error => {
        console.log(error)
        this.dialogProv.dismissLoading()
      })
  }

  deactivateCard() {
    // toDo: use for loop instead, handle notification when not founded
    this.userCards.forEach(card => {
      if (card.cardId == this.nfcProv.currentCard.id) {
        this.nfcProv.deactivateCard(this.selectedUser.id, card.id)
          .then(res => {
            this.dialogProv.showToast('done')
          })
          .catch(error => {
            this.dialogProv.showToast('failed')
          })

      }
    })
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
          this.credentials = { name: '', email: '', password: '', adminPass: '' }
          this.isNewUser = false
          this.dialogProv.showToast('Done')
        })
        .catch(error => {
          this.dialogProv.dismissLoading()
          this.dialogProv.authentificationErrorDlg(error, 'Créer client')
        })
    }
  }

  searchUser(searchString: string) {
    if (searchString) {
      this.searchList = this.userList.filter((user) => {

        return ((user.name.toLowerCase().indexOf(searchString.trim().toLowerCase()) > -1) || (user.email.toLowerCase().indexOf(searchString.trim().toLowerCase()) > -1))
      })
    }
    else {
      this.searchList = this.userList
    }
  }

  getRole() {
    return userRoleEnum[this.nfcProv.currentCard.role]
  }

  getCmd() {
    return nfcCmdEnum[this.nfcProv.currentCard.cmdType]
  }

  getCard(eventId) {
    if (!eventId) return this.userCards.length
    else {
      let counter = 0
      this.userCards.forEach(card => {
        if (card.eventId == eventId) counter++
      })

      return counter
    }
  }

  send() {
    console.log('yess', this.input)
    bluetooth.send({ msg: this.input })
  }

  close() {
    this.navCtrl.setRoot("IntroPage")
  }

  saveEventonDevice() {
    this.userProv.seCurrentEvent(this.selectedUserEventId).then(res => {
      this.dialogProv.showToast('Success, Done!')
    })
  }
}
