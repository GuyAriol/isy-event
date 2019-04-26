import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-input',
  templateUrl: 'input.html',
})
export class InputPage {

  terminalType = 'display'   // terminal || display

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,

  ) {
    if (Object.keys(navParams.data).length) this.terminalType = navParams.data

  }

  ionViewDidLoad() {
    console.log(this.terminalType);
  }

}
