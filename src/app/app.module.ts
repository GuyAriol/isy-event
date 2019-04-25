import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { DeviceProvider } from '../providers/device/device';
import { DialogProvider } from '../providers/dialog/dialog';
import { LanguageProvider } from '../providers/language/language';
import { NfcProvider } from '../providers/nfc/nfc';
import { StorageProvider } from '../providers/storage/storage';
import { SubscriptionProvider } from '../providers/subscription/subscription';
import { UserProvider } from '../providers/user/user';

@NgModule({
  declarations: [
    MyApp,
    HomePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
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
    UserProvider
  ]
})
export class AppModule {}
