import { Injectable } from '@angular/core';

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
