import { Injectable } from '@angular/core';
import { global } from '../global';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class BleProvider {

  scannedDevices = []

  constructor(


  ) {

  }

  /** start scanning bluetooth devices
   * use JSON.stringify to extract the data
   *
   * @returns {Observable<any>}
   * @memberof BleProvider
   */
  statScan() {


  }

  refresh(){
    console.log('refreshing')
    return this.scannedDevices

  }


  stopScan() {

  }
}
