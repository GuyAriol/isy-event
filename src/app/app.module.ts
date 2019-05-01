import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';

import { AngularFireModule } from 'angularfire2/';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';

import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Broadcaster } from '@ionic-native/broadcaster';
import { NFC, Ndef } from '@ionic-native/nfc';
import { AES256 } from '@ionic-native/aes-256';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';

import { MyApp } from './app.component';
import { DeviceProvider } from '../providers/device/device';
import { DialogProvider } from '../providers/dialog/dialog';
import { LanguageProvider } from '../providers/language/language';
import { NfcProvider } from '../providers/nfc/nfc';
import { StorageProvider } from '../providers/storage/storage';
import { SubscriptionProvider } from '../providers/subscription/subscription';
import { UserProvider } from '../providers/user/user';
import { BluetoothProvider } from '../providers/bluetooth/bluetooth';

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
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    AngularFireDatabaseModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    DeviceProvider,
    DialogProvider,
    LanguageProvider,
    NfcProvider,
    StorageProvider,
    SubscriptionProvider,
    UserProvider,
    BluetoothProvider,
    Broadcaster,
    NFC,
    Ndef,
    AES256,
    OpenNativeSettings
  ]
})
export class AppModule {}
