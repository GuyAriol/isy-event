import { Injectable } from '@angular/core';
import { StorageProvider } from '../storage/storage';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import 'rxjs/add/operator/take'
import { Observable } from 'rxjs/Observable';
import { global } from '../global';
import { Subscription } from 'rxjs/Subscription';

export interface userType {
  name: string,
  email: string,
  id: string,
  events: Array<eventType>,
  adminPass: string
}

export interface eventType {
  title: string,
  date: string,
  location: string,
  id: string,
  crew?: [
    {
      name: string,
      role: userRoleEnum,
      money: number,
      drinks: Array<{ type: string, total: number }>
    }]
}

export enum userRoleEnum { admin, entranceTicket, drinks, barman, superadmin, owner, client }


@Injectable()
export class UserProvider {

  currentUser: userType = null
  currentEventID = ''

  userSubscription: Subscription
  currentWorker = ''
  currentWorkerCardId = ''
  userEventList: eventType[] = []

  constructor(
    private localStorage: StorageProvider,
    private auth: AngularFireAuth,
    private afd: AngularFireDatabase

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
            events: [],
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
      if (user && Object.keys(user)) {
        this.currentUser = user

        this.localStorage.setToLocalStorage('iE_user', this.currentUser)
          .catch(error => console.log(error))

        this.getEventList()
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
      .then(res => {
        console.log(res)
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

  resetUser(){
    this.currentEventID = ''
    this.currentUser = null
    this.currentWorkerCardId = ''
    this.currentWorker = ''
    this.userEventList = []
  }
}
