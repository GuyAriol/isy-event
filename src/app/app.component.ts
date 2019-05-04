import { Component, ViewChild } from '@angular/core';
import { Platform, Events, Nav } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { DeviceProvider, terminalEnum } from '../providers/device/device';
import { BluetoothProvider } from '../providers/bluetooth/bluetooth';
import { SubscriptionProvider } from '../providers/subscription/subscription';
import { UserProvider } from '../providers/user/user';
import { userRoleEnum } from '../providers/nfc/nfc';

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
    event: Events



  ) {

    deviceProv.getCurrentPlatform()

    bluetoothProv.subscribeNativeEvent()

    // app events handler
    event.subscribe('login', data => {
      if (data == userRoleEnum.superadmin) this.nav.setRoot('SuperadminPage')
      else if (data == userRoleEnum.admin || data == userRoleEnum.owner) this.nav.setRoot('AdminPage')
      else this.nav.setRoot('InputPage', terminalEnum.terminal)
    })

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

