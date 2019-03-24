import { Component, ViewChild } from '@angular/core';
import { Platform, Events, Nav } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';

import { SubscriptionProvider } from '../providers/subscription/subscription';
import { DeviceProvider } from '../providers/device/device';
import { UserProvider } from '../providers/user/user';
import { userRole } from '../providers/nfc/nfc';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = 'IntroPage';
  @ViewChild(Nav) nav: Nav;

  constructor(
    platform: Platform,
    splashScreen: SplashScreen,
    subscription: SubscriptionProvider,
    deviceProv: DeviceProvider,
    userProv: UserProvider,
    event: Events


  ) {
    platform.ready().then(() => {
      if (platform.is('cordova')) splashScreen.hide();

      deviceProv.getCurrentPlatform()

      // app events handler
      event.subscribe('login', data => {
        if (data == userRole.superadmin) this.nav.setRoot('SuperAdminPage')
        else if (data == userRole.admin || data == userRole.owner) this.nav.setRoot('AdminPage')
        else this.nav.setRoot('HomePage')
      })

      subscription.defaultSubscription().then(() => {
        userProv.getCurrentUser().then(user => {
          if (user) subscription.userSubscription
        })
      })
    });
  }
}

