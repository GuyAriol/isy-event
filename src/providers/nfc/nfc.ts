import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the NfcProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class NfcProvider {

  constructor(public http: HttpClient) {
    console.log('Hello NfcProvider Provider');
  }

}
