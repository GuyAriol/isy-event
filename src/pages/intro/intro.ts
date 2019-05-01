import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { DialogProvider } from '../../providers/dialog/dialog';
import { UserProvider } from '../../providers/user/user';
import { NfcProvider } from '../../providers/nfc/nfc';
import { DeviceProvider } from '../../providers/device/device';


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

  ) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad IntroPage');
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

}
