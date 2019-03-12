import { Injectable } from '@angular/core';
import { DeviceProvider } from '../device/device';

@Injectable()
export class SubscriptionProvider {

  constructor(
    private deviceProv: DeviceProvider,

  ) {

  }

  defaultSubscription(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.deviceProv.subscribeNFC()

      resolve()
    });
  }

  userSubscription() {

  }

  defaultUnscription() {
    this.deviceProv.unsubscribeNFC()
  }
}
