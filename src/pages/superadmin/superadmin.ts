import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DeviceProvider, terminalEnum } from '../../providers/device/device';
import { BluetoothProvider } from '../../providers/bluetooth/bluetooth';
import { NfcProvider, nfcCardType, nfcCmdEnum } from '../../providers/nfc/nfc';
import { DialogProvider } from '../../providers/dialog/dialog';
import { UserProvider, eventType, userType, userRoleEnum } from '../../providers/user/user';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { SubscriptionProvider } from '../../providers/subscription/subscription';
import { currentPage, logType } from '../../providers/global';
import { StorageProvider } from '../../providers/storage/storage';

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

  isPreparemenu = false
  isManageClient = false
  isFinalizeEvent = false

  total = 0
  totalDrinks = 0
  workerLogs = {}
  workerList = []

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public deviceProv: DeviceProvider,
    public bluetoothProv: BluetoothProvider,
    public userProv: UserProvider,
    public nfcProv: NfcProvider,
    private dialogProv: DialogProvider,
    private subscriptionProv: SubscriptionProvider,
    private storageProv: StorageProvider

  ) {
    this.nfcCard.role = userRoleEnum.superadmin
    currentPage.name = 'superadmin'
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
    currentPage.name = ''

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
        this.dialogProv.showToast('Terminé avec succèss')
      })
      .catch(error => {
        console.log(error)
        this.dialogProv.dismissLoading()
        this.dialogProv.showSimpleDialog('Érreur', '', 'Carte activée. Mais connection serveur echouée', 'Ok')
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
    // toDo: update all missing properties.

    if (!this.selectedUser.id) this.dialogProv.showToast('Selection un client')
    else if (!this.newEvent.title) this.dialogProv.showToast('Donner un titre')
    else {
      this.dialogProv.showLoading('En cours', 120000)

      this.newEvent.pricing = [
        { name: 'XS - 5 euro', price: 5, description: 'Water, Redbull, Bier' },
        { name: 'S - 10 euro', price: 10, description: 'Limo, Baileys 0.2L, <br>Whisky Cola' },
        { name: 'M - 60 euro', price: 60, description: 'Asti, Baileys 0.7L' },
        { name: 'L - 100 euro', price: 100, description: 'Black, Red Label, <br>Chivas 12Y, Jack' },
        { name: 'XL - 120 euro', price: 120, description: 'Chivas 18Y, Gold, <br>Hennesy, Ciroc Vodka' },
        { name: 'XL - 120 euro', price: 120, description: 'Ruinart, MOET, Remy' },
        { name: 'VIP 1 - 150 euro', price: 150, description: 'Hennesy Fine <br>de Cognac' },
        { name: 'VIP 2 - xx euro', price: 0, description: '' },
        { name: 'VIP 3 - xx euro', price: 0, description: '' },
      ]

      this.newEvent.drinksBegin =
        {
          'XS - 5 euro': 0,
          'S - 10 euro': 0,
          'M - 60 euro': 0,
          'L - 100 euro': 0,
          'XL - 120 euro': 0,
          'VIP 1 - 150 euro': 0,
          'VIP 2 - xx euro': 0,
          'VIP 3 - xx euro': 0
        }

      this.userProv.createNewEvent(this.newEvent, this.selectedUser.id)
        .then(() => {
          this.dialogProv.dismissLoading()
          this.isNewEvent = false
          this.newEvent = { title: '', location: '', date: '', id: '', crew: [], devices: [], pricing: [], drinksBegin: {} }
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
    this.userProv.setCurrentEvent(this.selectedUserEventId).then(res => {
      this.dialogProv.showToast('Success, Done!')
    })
  }

  resetDevice() {
    this.subscriptionProv.defaultUnscription()
    this.userProv.resetUser()
    this.dialogProv.showSimpleDialog('Important', '', "Rédemarrer l'application pour terminer l'initialisation", 'Ok')
  }

  setSuperAdmin() {
    this.dialogProv.showLoading('En cours ...', 30000)

    let card: nfcCardType = {
      id: '',
      cmdType: nfcCmdEnum.login,
      balance: 0,
      maxsize: '',
      type: '',
      role: userRoleEnum.superadmin,
      cardOk: false,
      eventId: '',
      eventName: '',
      workerName: ' '
    }

    this.nfcProv.writeCard(card)
      .then(() => {
        this.dialogProv.dismissLoading()
        this.dialogProv.showToast('done')
      })
      .catch(error => {
        console.log(error)
        this.dialogProv.dismissLoading()
        this.dialogProv.showToast('Error')
      })
  }

  getLogs(): Promise<any> {
    this.dialogProv.showLoading('Loading ...', 100000)

    this.total = 0
    this.workerLogs = {}
    this.workerList = []

    return new Promise((resolve, reject) => {
      this.storageProv.getFromLocalStorage('iE_eventLog')
        .then((logs: logType[]) => {
          if (logs) {
            logs.forEach(log => {
              if (!log.note) this.total += log.amount
              else this.totalDrinks += log.amount

              let found = false
              for (let key in this.workerLogs) {
                if (key == log.worker) {
                  found = true
                  if (!log.note) this.workerLogs[log.worker].total += log.amount
                  else {
                    this.workerLogs[log.worker].totalDrinks += log.amount
                    this.workerLogs[log.worker].drinks[log.note] += 1
                  }
                  break
                }
              }

              if (!found) {
                let temp = {}
                if (log.note) temp[log.note] = 1

                this.workerLogs[log.worker] = {
                  name: log.worker,
                  total: !log.note ? log.amount : 0,
                  drinks: temp,
                  totalDrinks: log.note ? log.amount : 0
                }
              }
            })

            for (let worker in this.workerLogs) {

              let drinksTemp = []
              for (let drink in this.workerLogs[worker].drinks) {
                drinksTemp.push({ drink: drink, total: this.workerLogs[worker].drinks[drink] })
              }

              this.workerList.push({ name: worker, total: this.workerLogs[worker].total, drinks: drinksTemp })
            }


          }

          this.dialogProv.dismissLoading()
          this.dialogProv.showToast('Done')
        })
        .catch(error => {
          this.dialogProv.dismissLoading()
          this.dialogProv.showToast('Error')
          console.log(error)
        })
    })
  }
}
