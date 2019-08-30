import { Component } from "@angular/core";
import { ViewController, NavController, NavParams } from "ionic-angular";
import { NfcProvider } from "../../providers/nfc/nfc";
import { UserProvider } from "../../providers/user/user";
import { logType } from "../../providers/global";

@Component({
  template: `
    <ion-list>
      <h2 text-center>{{userProv.currentWorker}}</h2>

      <div *ngIf="type=='cash'">
        <ion-item>
          <p style="color: tomato">Cash box: {{total}} euro</p>
          <p style="color: tomato">Total cash in: {{totalIn}} euro</p>
          <p style="color: tomato">Total cash out: {{totalOut}} euro</p>
        </ion-item>

        <div *ngFor="let worker of workerList">
          <ion-item>
            <p><b>{{worker.name}}</b></p>
            <p>Cash final: {{worker.totalCash + worker.totalTakeIn + worker.totalTakeOut}} euro</p>
            <p>Cash in: {{worker.totalCash - worker.totalCashOut}} euro</p>
            <p>Cash out: {{worker.totalCashOut}} euro</p>
            <p>Take in: {{worker.totalTakeIn}} euro</p>
            <p>Take out: {{worker.totalTakeOut}} euro</p>
          </ion-item>
        </div>
      </div>

      <div *ngIf="type=='bar'">
        <ion-item>
          <ion-label color=danger>total drinks sell: {{total}} euro</ion-label>
        </ion-item>

        <div *ngFor="let worker of workerList">
          <ion-item>
            <p><b>{{worker.name}} (sell for {{worker.totalDrinks}} euro)</b></p>

            <div *ngFor="let drink of worker.drinks">
              <p>{{drink.drink}} <span style="float: right">{{drink.total}}</span></p>
            </div>
          </ion-item>
        </div>
      </div>

      <button ion-item (click)="close()">Verouiller l'écran</button>
      <button ion-item (click)="openAdmin()">Admin</button>
      </ion-list>
  `
})

export class TerminalPopover {

  total = 0
  totalOut = 0
  totalIn = 0
  workerLogs = {}
  workerList = []
  totalTakeIn = 0
  totalTakeOut = 0

  type = ''

  constructor(
    public viewCtrl: ViewController,
    public navCtrl: NavController,
    public nfcProv: NfcProvider,
    public userProv: UserProvider,
    private navparams: NavParams

  ) {
    this.type = this.navparams.data.data

    this.userProv.evaluateEventData().then(result => {
      if (this.type == 'cash') this.total = result.totalCash
      else if (this.type == 'bar') this.total = result.totalDrinks
      this.workerLogs = result.workerObject
      this.workerList = result.workerList

      this.totalIn = result.cashIN
      this.totalOut = result.cashOut

    })

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
