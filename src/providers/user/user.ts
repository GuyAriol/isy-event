import { Injectable } from '@angular/core';
import { StorageProvider } from '../storage/storage';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import 'rxjs/add/operator/take'
import { Observable } from 'rxjs/Observable';
import { global, logType } from '../global';
import { Subscription } from 'rxjs/Subscription';
import { terminalEnum } from '../device/device';

export interface userType {
  name: string,
  email: string,
  id: string,
  events: eventType,
  adminPass: string
}

export interface eventType {
  title: string,
  date: string,
  location: string,
  id: string,
  crew: Array<workerType>,
  devices: Array<{ bluetoothName: string, bluetoothId: string, type: terminalEnum }>,
  drinksBegin: any,
  pricing: Array<any>
}

export interface workerType {
  name: string,
  role: userRoleEnum,
  money: number,
  drinks: any,
  moneyOut: number,
  moneyIn: number
  moneyBegin: number
}

export enum userRoleEnum { admin, entranceTicket, drinks, barman, superadmin, owner, client }

interface logEval { workerObject: any, workerList: Array<any>, totalCash: number, totalDrinks: number, cashIN: number, cashOut: number }

export const pricingList = [
  { name: 'XS - 5 euro', price: 5, description: 'Water, Redbull, Bier' },
  { name: 'S - 10 euro', price: 10, description: 'Limo, Baileys 0.2L, <br>Whisky Cola' },
  { name: 'M - 60 euro', price: 60, description: 'Asti, Baileys 0.7L' },
  { name: 'L - 100 euro', price: 100, description: 'Black, Red Label, <br>Chivas 12Y, Jack' },
  { name: 'XL - 120 euro', price: 120, description: 'Chivas 18Y, Gold, <br>Hennesy, Ciroc Vodka' },
  { name: 'XL - 120 euro', price: 120, description: 'Ruinart, MOET, Remy' },
  { name: 'VIP 1 - 150 euro', price: 150, description: 'Hennesy Fine <br>de Cognac' },
  { name: 'VIP 2 - xx euro', price: 0, description: '' },
  { name: 'VIP 3 - xx euro', price: 0, description: '' },
]

@Injectable()
export class UserProvider {

  currentUser: userType = null
  currentEventID = ''

  userSubscription: Subscription
  currentWorker = ''
  currentWorkerCardId = ''
  userEventList: eventType[] = []

  totalCash = 0
  totalDrinks = 0
  totalCashIn = 0
  totalCashOut = 0

  constructor(
    private localStorage: StorageProvider,
    private auth: AngularFireAuth,
    private afd: AngularFireDatabase,

  ) {

  }

  getCurrentUser(): Promise<any> {
    if (global.isDebug) {
      console.log('--UserProvider-getCurrentUser')
    }

    return new Promise((resolve, reject) => {
      this.localStorage.getFromLocalStorage('iE_user')
        .then(user => {
          if (user) { this.currentUser = user; this.getEventList() }
          else this.currentUser = null

          resolve(user)
        })
        .catch(error => reject(error))
    });
  }

  signUp(credentials): Promise<any> {
    if (global.isDebug) {
      console.log('--UserProvider-signUp')
    }

    return new Promise((resolve, reject) => {
      this.auth.auth.createUserWithEmailAndPassword(credentials.email, credentials.password)
        .then(res => {

          this.currentUser = {
            name: credentials.name,
            email: credentials.email,
            id: res.uid,
            events: {} as eventType,
            adminPass: credentials.adminPass
          }

          this.localStorage.setToLocalStorage('iE_user', this.currentUser)

          this.afd.object(`users/${res.uid}`).set(this.currentUser)
            .then(() => resolve(this.currentUser))
            .catch(error => reject(error))

        })
        .catch(error => reject(error))

    });
  }

  signIn(credentials): Promise<any> {
    if (global.isDebug) {
      console.log('--UserProvider-signIn')
    }

    return new Promise((resolve, reject) => {
      this.auth.auth.signInWithEmailAndPassword(credentials.email, credentials.password)
        .then(
          res => {
            // this.afd.object(`users/${res.uid}`).valueChanges().take(1).subscribe((user: userType) => {
            //   this.currentUser = user
            //   this.localStorage.setToLocalStorage('iE_user', this.currentUser)

            //   resolve()
            // })

            this.subscribeUser(res.uid)
            resolve()
          })


        .catch(error => reject(error))
    });
  }

  getAllUsersObsvr() {
    if (global.isDebug) {
      console.log('--UserProvider-getAllUsersObsvr')
    }

    return <Observable<userType[]>>this.afd.list('users').valueChanges()
  }

  createNewEvent(event: eventType, userID): Promise<any> {
    if (global.isDebug) {
      console.log('--UserProvider-createNewEvent')
    }

    return new Promise((resolve, reject) => {
      event.id = this.afd.createPushId()

      this.afd.object(`users/${userID}/events/${event.id}`).set(event)
        .then(() => resolve())
        .catch(error => reject(error))
    });
  }

  /** Log out from the APP
   *
   * @memberof UserProvider
   */
  logOut(): Promise<any> {
    if (global.isDebug) {
      console.log('--UserProvider-logOut')
    }

    return new Promise((resolve, reject) => {
      this.auth.auth.signOut()
        .then(() => {
          this.currentUser = null
          resolve()
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  setCurrentEvent(eventId): Promise<any> {
    if (global.isDebug) {
      console.log('--UserProvider-seCurrentEvent')
    }

    return new Promise((resolve, reject) => {
      this.currentEventID = eventId

      this.localStorage.setToLocalStorage('iE_currentEvent', eventId)
        .then(res => {
          resolve()
        })
        .catch(error => {
          console.log(error)
          reject()
        })
    });
  }

  getCurrentEvent() {
    if (global.isDebug) {
      console.log('--UserProvider-getCurrentEvent')
    }

    this.localStorage.getFromLocalStorage('iE_currentEvent')
      .then(event => {
        if (event) this.currentEventID = event
      })
      .catch(error => {
        console.log(error)
      })
  }

  subscribeUser(userId) {
    if (global.isDebug) {
      console.log('--UserProvider-subscribeUser')
    }

    this.userSubscription = this.afd.object(`users/${userId}`).valueChanges().subscribe((user: userType) => {
      if (user && Object.keys(user).length) {
        this.currentUser = user

        this.localStorage.setToLocalStorage('iE_user', this.currentUser)
          .catch(error => console.log(error))

        this.getEventList()
        this.compileEventData(this.currentEventID)
      }
    })
  }

  unsubscribeUser() {
    if (global.isDebug) {
      console.log('--UserProvider-unsubscribeUser')
    }

    try {
      this.userSubscription.unsubscribe()
    } catch (error) {

    }
  }

  updateUser(user: userType) {
    if (global.isDebug) {
      console.log('--UserProvider-createEventUser')
    }

    this.localStorage.setToLocalStorage('iE_user', user)

    this.afd.object(`users/${this.currentUser.id}`).update(this.currentUser)
      .then(() => {

      }, fail => {
        console.log(fail)
      })
      .catch(error => {
        console.log(error)
      })
  }

  getRoleString(role: number) {
    return userRoleEnum[role]
  }

  getEventList() {
    if (global.isDebug) {
      console.log('--UserProvider-getEventList')
    }

    this.userEventList = []

    for (let eventKey in this.currentUser.events) {
      this.userEventList.push(this.currentUser.events[eventKey])
    }
  }

  resetUser() {
    this.currentEventID = ''
    this.currentUser = null
    this.currentWorkerCardId = ''
    this.currentWorker = ''
    this.userEventList = []
  }

  evaluateEventData(): Promise<logEval> {
    return new Promise((resolve, reject) => {
      let totalCash = 0
      let cashIN = 0
      let cashOut = 0
      let totalDrinks = 0
      let workerLogs = {}
      let workerList = []

      this.localStorage.getFromLocalStorage('iE_eventLog').then((logs: logType[]) => {
        if (logs) {
          logs.forEach(log => {
            if (!log.note) {
              totalCash += log.amount
              if (log.amount < 0) cashOut += log.amount
              else cashIN += log.amount
            }
            else {
              totalDrinks += log.amount
            }

            let found = false
            for (let key in workerLogs) {
              if (key == log.worker) {
                found = true

                if (!log.note) {
                  workerLogs[log.worker].totalCash += log.amount
                  if (log.amount < 0) workerLogs[log.worker].totalCashOut += log.amount
                }
                else {
                  workerLogs[log.worker].totalDrinks += log.amount

                  if (workerLogs[log.worker].drinks[log.note]) workerLogs[log.worker].drinks[log.note]++
                  else workerLogs[log.worker].drinks[log.note] = 1
                }

                break
              }
            }

            if (!found) {
              let temp = {}

              if (log.note) temp[log.note] = 1

              workerLogs[log.worker] = {
                name: log.worker,
                totalCash: !log.note ? log.amount : 0,
                totalDrinks: log.note ? log.amount : 0,
                drinks: temp,
                totalCashOut: !log.note && log.amount < 0 ? log.amount : 0
              }

            }
          })

          for (let worker in workerLogs) {
            let drinksTemp = []
            for (let drink in workerLogs[worker].drinks) {
              drinksTemp.push({ drink: drink, total: workerLogs[worker].drinks[drink] })
            }

            workerList.push({
              name: worker, totalCash: workerLogs[worker].totalCash,
              totalDrinks: workerLogs[worker].totalDrinks, drinks: drinksTemp, totalCashOut: workerLogs[worker].totalCashOut
            })
          }

          resolve({ workerObject: workerLogs, workerList: workerList, totalCash: totalCash, totalDrinks: totalDrinks, cashIN: cashIN, cashOut: cashOut })
        }
      })
    })

  }

  getWorkerDrinkStatics(eventId) {
    let drinkStatics = {}
    try {
      this.currentUser.events[eventId].crew.forEach((worker, index) => {
        if (worker.role == 3) {

          drinkStatics[index] = []

          for (let drink in worker.drinks) {
            drinkStatics[index].push({ type: drink, total: worker.drinks[drink] })
          }
        }
      })

      return drinkStatics

    } catch (error) {
      console.log(error)
      return drinkStatics
    }
  }

  compileEventData(eventId) {
    this.totalCash = 0
    this.totalDrinks = 0
    this.totalCashIn = 0
    this.totalCashOut = 0

    if (eventId) {
      this.currentEventID = eventId

      this.currentUser.events[eventId].crew.forEach(worker => {
        if (worker.role == userRoleEnum.drinks) {
          this.totalCash += worker.money
          if (worker.moneyOut) this.totalCashOut += worker.moneyOut
        }

        else if (worker.role == userRoleEnum.barman) {
          for (let drink in worker.drinks) {
            this.totalDrinks += parseInt(drink.split('-')[1]) * worker.drinks[drink]
          }
        }
      })

      this.totalCashIn = this.totalCash - this.totalCashOut
    }
    return { cash: this.totalCash, drinks: this.totalDrinks, cashIn: this.totalCashIn, cashOut: this.totalCashOut }
  }

  uploadEventData(): Promise<any> {
    return new Promise((resolve, reject) => {

    });
  }

  test() {
    let temp = {
      'XS - 5 euro': 0,
      'S - 10 euro': 0,
      'M - 60 euro': 0,
      'L - 100 euro': 0,
      'XL - 120 euro': 0,
      'VIP 1 - 150 euro': 0,
      'VIP 2 - xx euro': 0,
      'VIP 3 - xx euro': 0
    }
    this.afd.object(`users/${this.currentUser.id}/events/${this.currentEventID}`)
      .update({drinksBegin: temp})

  }
}
