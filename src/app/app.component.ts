import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { DeviceProvider } from '../providers/device/device';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = 'SuperadminPage';

  constructor(
    platform: Platform,
    splashScreen: SplashScreen,
    status: StatusBar,
    deviceProv: DeviceProvider

  ) {

    deviceProv.getCurrentPlatform()

    platform.ready().then(() => {
      if (platform.is('cordova')) {
        splashScreen.hide(); status.hide()
        bluetooth.activateBluetooth()
      }


    });
  }
}

