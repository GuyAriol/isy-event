import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, Events } from 'ionic-angular';
import { DialogProvider } from '../../providers/dialog/dialog';
import { UserProvider, userRoleEnum } from '../../providers/user/user';
import { DeviceProvider, terminalEnum } from '../../providers/device/device';
import { StorageProvider } from '../../providers/storage/storage';
import { SubscriptionProvider } from '../../providers/subscription/subscription';
import { NfcProvider } from '../../providers/nfc/nfc';


@IonicPage()
@Component({
  selector: 'page-intro',
  templateUrl: 'intro.html',
})
export class IntroPage {

  showLogin = false
  credentials = {} as { email: string, password: string, name }

  constructor(
    public navCtrl: NavController,
    private dialogProv: DialogProvider,
    public userProv: UserProvider,
    public deviceProv: DeviceProvider,
    private storageProv: StorageProvider,
    private alertCtrl: AlertController,
    private subscriptionProv: SubscriptionProvider,
    private event: Events,
    private nfcProv: NfcProvider

  ) {

  }

  ionViewDidLoad() {
    this.storageProv.getFromLocalStorage('iE_deviceType').then(res => {
      if (res == terminalEnum.display) this.navCtrl.setRoot('InputPage', terminalEnum.display)
    })

    // app events handler
    this.event.subscribe('iE-login', data => {
      if (this.userProv.currentUser) {
        this.userProv.currentWorker = this.nfcProv.currentCard.workerName

        if (data == userRoleEnum.superadmin) {
          this.navCtrl.setRoot('SuperadminPage');
        }
        else if (data == userRoleEnum.admin || data == userRoleEnum.owner) {
          this.navCtrl.setRoot('AdminPage');
        }
        else if (data == userRoleEnum.barman) {
          this.navCtrl.setRoot('OutputPage')
        }
        else {
          this.navCtrl.setRoot('InputPage')
        }
      }
      else {
        this.alertCtrl.create({
          title: 'Attention',
          message: "Vous n'êtes pas connecté !",
          buttons: [
            {
              text: 'Connexion',
              handler: () => {
                this.showLogin = true
              }
            }
          ]
        }).present()
      }

    })
  }

  ionViewDidEnter() {
    setTimeout(() => {
      if (this.deviceProv.terminalType != terminalEnum.none && !this.userProv.currentEventID) {
        this.dialogProv.showSimpleDialog('Attention', '', 'Flag for target event is missing. The admin should configure this device !', 'Ok')
      }
    }, 5000);
  }

  signin() {
    this.dialogProv.showLoading('Loading ..', 150000)

    try {
      this.userProv.signIn(this.credentials)
        .then(() => {
          this.dialogProv.dismissLoading()
          this.showLogin = false
          this.dialogProv.showToast('Connecté')
        })
        .catch(error => {
          this.dialogProv.authentificationErrorDlg(error, 'Érreur de connexion')
          this.dialogProv.dismissLoading()
        })
    } catch (error) {

    }

  }

  login() {
    this.showLogin = true
  }

  cancel() {
    this.showLogin = false
  }

  signOut() {
    this.userProv.logOut()
    this.subscriptionProv.defaultUnscription()
  }

  superAdmin() {
    if (this.userProv.currentUser) this.navCtrl.setRoot('SuperadminPage')
    else this.showLogin = true
  }

  openAdminPage(eventId) {
    this.alertCtrl.create({
      title: 'Mot de passe',
      inputs: [
        {
          name: 'pass',
          type: 'password'
        }
      ],
      buttons: [
        {
          text: 'Annuler'
        },
        {
          text: 'Ok',
          handler: data => {
            if (data.pass == this.userProv.currentUser.adminPass) this.navCtrl.setRoot('AdminPage', eventId)
            else {
              this.dialogProv.showToast('Mot de passe incorrect')
              this.openAdminPage(eventId)
            }
          }
        }
      ]
    }).present()



  }
}
