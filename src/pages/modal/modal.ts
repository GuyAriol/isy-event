import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { NfcProvider } from '../../providers/nfc/nfc';
import { UserProvider } from '../../providers/user/user';
import { logType } from '../../providers/global';
import { DialogProvider } from '../../providers/dialog/dialog';

@IonicPage()
@Component({
  selector: 'page-modal',
  templateUrl: 'modal.html',
})
export class ModalPage {

  data = {} as { title: string, msg: string, type: string }
  input = ''

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private nfcProv: NfcProvider,
    private userProv: UserProvider,
    private dialogProv: DialogProvider,
    private viewCtrl: ViewController

  ) {
    this.data = navParams.data
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ModalPage');
  }

  numPad(input) {
    this.input += input
  }

  backscape() {
    this.input = this.input.substr(0, this.input.length - 1)
  }

  submit() {
    let log: logType = {
      timeStamp: Date.now(),
      worker: this.userProv.currentWorker,
      amount: 0,
      note: '',
      workerId: this.userProv.currentWorkerCardId,
      takeIn: this.data.type == 'takeIn' ? parseFloat(this.input) : 0,
      takeOut: this.data.type == 'takeOut' ? -parseFloat(this.input) : 0
    }

    this.nfcProv.saveTransaction(log)
    this.viewCtrl.dismiss()
    this.dialogProv.showToast('Done')
  }


}
