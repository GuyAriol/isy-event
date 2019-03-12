import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import {AngularFireModule} from 'angularfire2/';
import {AngularFireDatabaseModule} from 'angularfire2/database';
import {AngularFireAuthModule} from 'angularfire2/auth';

import { SplashScreen } from '@ionic-native/splash-screen';
import { NFC, Ndef } from '@ionic-native/nfc';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';

const firebaseConfig = {
  apiKey: "AIzaSyCfhQIXhUXY1FQOov_pQk63G4frcZe5HBk",
  authDomain: "isy-event.firebaseapp.com",
  databaseURL: "https://isy-event.firebaseio.com",
  projectId: "isy-event",
  storageBucket: "isy-event.appspot.com",
  messagingSenderId: "320935505950"
};

@NgModule({
  declarations: [
    MyApp,
    HomePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    AngularFireDatabaseModule

  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    NFC,
    Ndef
  ]
})
export class AppModule {}
