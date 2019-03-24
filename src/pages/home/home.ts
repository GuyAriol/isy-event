import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { NfcProvider } from '../../providers/nfc/nfc';
import { AES256 } from '@ionic-native/aes-256';
import { encription } from '../../providers/global';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private nfcProv: NfcProvider,
    private encrypt: AES256,
    private alertCtrl: AlertController

  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HomePage');
  }

  d(data) {
    console.log(data)
    this.encrypt.decrypt(encription.key, encription.IV, data)
      .then(res => console.log(res))
      .catch(er => console.log(er))
  }

  e(data) {
    console.log(data)
    this.encrypt.encrypt(encription.key, encription.IV, data)
      .then(res => console.log(res))
      .catch(er => console.log(er))
  }

  test(){
    this.alertCtrl.create({
      title: 'Carte vide',
      subTitle: '',
      message: `id: `,
      buttons: [
        {
          text: 'cancel',
          cssClass: 'dialog-cancel',
          handler: () => {
            console.log('Cancel cliked');
          }
        },
        {
          text: 'ok',
          cssClass:'dialog-submit',
          handler: () => {
            console.log('ok buton clicked');
          }
        }
      ]
    }).present();
  }
}
