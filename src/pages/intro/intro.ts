import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { UserProvider } from '../../providers/user/user';
import { DialogProvider } from '../../providers/dialog/dialog';
import { DeviceProvider } from '../../providers/device/device';
import { NfcProvider, nfcType, nfcCmdEnum, userRole } from '../../providers/nfc/nfc';


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
    public userProv: UserProvider,
    private dialogProv: DialogProvider,
    public deviceProv: DeviceProvider,
    private nfcProv: NfcProvider

  ) {
  }

  login() {
    this.showLogin = true
  }

  signin() {
    this.dialogProv.showLoading('Loading ..', 150000)

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
  }

  cancel() {
    this.showLogin = false
  }

  test() {
    let data: nfcType = {
      cmdType: nfcCmdEnum.login,
      id: '',
      balance: '000000',
      maxsize: '',
      role: userRole.superadmin,
      type: '',
      cardOk: false
    }


    this.nfcProv.buildNfcPayload(data)
      .then(res => {
        this.nfcProv.writeNFC(res)
      })
      .catch(error => {
        console.log(error)
      })
  }

}
