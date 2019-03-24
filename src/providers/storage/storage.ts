import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { global } from '../global';

@Injectable()
export class StorageProvider {

  constructor(
    private local: Storage
  ) {
  }

  /** Get data from local storage
   *
   * @param {string} key
   * @returns {Promise<any>}
   * @memberof StorageProvider
   */
  getFromLocalStorage(key: string): Promise<any> {
    if (global.isDebug) {
      console.log('--StorageProvider-getFromLocalStorage');
    }

    return new Promise((resolve, reject) => {
      this.local.get(key).then(result => {
        resolve(result)
      },
        error => {
          reject(error)
        })
    });
  }

  /** Write data to local storage
   *
   * @param {string} key
   * @param {*} value
   * @returns {Promise<any>}
   * @memberof StorageProvider
   */
  setToLocalStorage(key: string, value: any): Promise<any> {
    if (global.isDebug) {
      console.log('--StorageProvider-setToLocalStorage');
    }

    return new Promise((resolve, reject) => {
      this.local.set(key, value).then(() => {
        resolve()
      },
        error => {
          reject(error)
        })
    });
  }

  /** Remove data from local storage
   *
   * @param {string} key
   * @returns {Promise<any>}
   * @memberof StorageProvider
   */
  removeFromLocalStorage(key: string): Promise<any> {
    if (global.isDebug) {
      console.log('--StorageProvider-removeFromLocalStorage');
    }

    return new Promise((resolve, reject) => {
      this.local.remove(key).then(() => {
        resolve()
      },
        error => {
          if (global.isDebug) {
            console.log(error);
          }

          reject()
        })
    });
  }
}
