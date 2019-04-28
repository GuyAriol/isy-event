import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { BleProvider } from '../../providers/ble/ble';


@IonicPage()
@Component({
  selector: 'page-intro',
  templateUrl: 'intro.html',
})
export class IntroPage {


  constructor(public navCtrl: NavController, public navParams: NavParams,
    public ble: BleProvider

  ) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad IntroPage');
  }

}
