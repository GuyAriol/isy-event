import { Component } from "@angular/core";
import { ViewController, NavController, NavParams } from "ionic-angular";
import { StorageProvider } from "../../providers/storage/storage";
import { NfcProvider } from "../../providers/nfc/nfc";
import { UserProvider } from "../../providers/user/user";
import { logType } from "../../providers/global";

@Component({
  template: `
    <ion-list>
      <h2 text-center>{{userProv.currentWorker}}</h2>

      <div *ngIf="type=='cash'">
        <ion-item>
          <ion-label color=danger>Cash box: {{total}} euro</ion-label>
        </ion-item>

        <div *ngFor="let worker of workerList">
          <ion-item>
            <p><b>{{worker.name}}</b></p>
            <p>{{worker.total}} euro</p>
          </ion-item>
        </div>
      </div>

      <div *ngIf="type=='bar'">

      </div>

      <button ion-item (click)="close()">Verouiller l'écran</button>
      <button ion-item (click)="openAdmin()">Admin</button>
      </ion-list>
  `
})

export class TerminalPopover {

  total = 0
  workerLogs = {}
  workerList = []

  type = ''

  constructor(
    public viewCtrl: ViewController,
    public navCtrl: NavController,
    private storageProv: StorageProvider,
    public nfcProv: NfcProvider,
    public userProv: UserProvider,
    private navparams: NavParams

  ) {
    this.type = this.navparams.data.data

    if (this.type == 'cash') {
      this.storageProv.getFromLocalStorage('iE_eventLog').then((logs: logType[]) => {
        if (logs) {

          logs.forEach(log => {
            this.total += log.amount

            let found = false
            for (let key in this.workerLogs) {
              if (key == log.worker) {
                found = true
                this.workerLogs[log.worker].total += log.amount
                break
              }
            }

            if (!found) {
              this.workerLogs[log.worker] = { name: log.worker, total: log.amount }
            }
          })

          for (let worker in this.workerLogs) {
            this.workerList.push({ name: worker, total: this.workerLogs[worker].total })
          }
        }
      })
    }
    else if (this.type == 'bar') {

    }
    else {

    }

  }

  close() {
    this.viewCtrl.dismiss();
    this.navCtrl.setRoot('IntroPage')
  }

  openAdmin() {
    this.viewCtrl.dismiss();
    this.navCtrl.setRoot('AdminPage')
  }
}
