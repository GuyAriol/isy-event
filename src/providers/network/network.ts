import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';
import { global } from '../global';

@Injectable()
export class NetworkProvider {

  networkConnectSubscription: Subscription
  networkDisconnectSubscription: Subscription
  isOnline = true

  constructor(
    private network: Network,

  ) {

  }

  subscribeNetwork() {
    if (global.isDebug) {
      console.log('--NetworkProvider-subscribeNetwork')
    }

    this.isOnline = true

    this.networkConnectSubscription = this.network.onConnect().subscribe(() => {
      console.log('internet connection')
    })

    this.networkDisconnectSubscription = this.network.onDisconnect().subscribe(() => {
      console.log('internet disconnect')
    })
  }

  unsubscribeNetwork() {
    if (global.isDebug) {
      console.log('--NetworkProvider-unsubscribeNetwork')
    }

    this.isOnline = false

    try {
      this.networkConnectSubscription.unsubscribe()
    } catch (error) {

    }

    try {
      this.networkDisconnectSubscription.unsubscribe()
    } catch (error) {

    }

  }
}
