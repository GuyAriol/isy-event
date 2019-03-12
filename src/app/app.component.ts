import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';

import { SubscriptionProvider } from '../providers/subscription/subscription';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = 'HomePage';

  constructor(
    platform: Platform,
    splashScreen: SplashScreen,
    subscription: SubscriptionProvider

  ) {
    platform.ready().then(() => {
      if (platform.is('cordova')) splashScreen.hide();

      subscription.defaultSubscription()
    });
  }
}

