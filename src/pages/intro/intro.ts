import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { DialogProvider } from '../../providers/dialog/dialog';
import { UserProvider } from '../../providers/user/user';
import { DeviceProvider, terminalEnum } from '../../providers/device/device';
import { StorageProvider } from '../../providers/storage/storage';


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
    private storageProv: StorageProvider

  ) {

  }

  ionViewDidLoad() {
    this.storageProv.getFromLocalStorage('iE_deviceType').then(res => {
      if (res == terminalEnum.display) this.navCtrl.setRoot('InputPage', terminalEnum.display)
    })
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
  }

  superAdmin() {
    this.navCtrl.setRoot('SuperadminPage')
  }
}
