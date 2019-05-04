import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-admin',
  templateUrl: 'admin.html',
})
export class AdminPage {

  constructor(
    public navCtrl: NavController,


     ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AdminPage');
  }

  superAdmin() {
    this.navCtrl.setRoot('SuperadminPage')
  }
}
