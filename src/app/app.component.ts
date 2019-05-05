import { Component, ViewChild } from '@angular/core';
import { Platform, Nav } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { DeviceProvider, terminalEnum } from '../providers/device/device';
import { BluetoothProvider } from '../providers/bluetooth/bluetooth';
import { SubscriptionProvider } from '../providers/subscription/subscription';
import { UserProvider, userRoleEnum } from '../providers/user/user';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage: any = 'IntroPage';

  constructor(
    platform: Platform,
    splashScreen: SplashScreen,
    status: StatusBar,
    deviceProv: DeviceProvider,
    bluetoothProv: BluetoothProvider,
    subscribeProv: SubscriptionProvider,
    userProv: UserProvider,



  ) {

    deviceProv.getCurrentPlatform()

    bluetoothProv.subscribeNativeEvent()

    platform.ready().then(() => {
      if (platform.is('cordova')) {
        splashScreen.hide(); status.hide()
        bluetooth.activateBluetooth()
      }

      subscribeProv.defaultSubscription().then(res => {

        userProv.getCurrentUser().then(user => {
          if (user) subscribeProv.userSubscription(user.id).then(() => {

          })
        })
      })
    });
  }
}

