import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = 'IntroPage';

  constructor(
    platform: Platform,
    splashScreen: SplashScreen,
    status: StatusBar

  ) {

    platform.ready().then(() => {
      if (platform.is('cordova')) {splashScreen.hide(); status.hide()}


    });
  }
}

