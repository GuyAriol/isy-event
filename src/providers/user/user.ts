import { Injectable } from '@angular/core';
import { StorageProvider } from '../storage/storage';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import 'rxjs/add/operator/take'
import { Observable } from 'rxjs/Observable';

export interface userType {
  name: string,
  email: string,
  id: string,
  events: Array<eventType>
}

export interface eventType {
  title: string,
  date: string,
  location: string,
  id: string
}

@Injectable()
export class UserProvider {

  currentUser: userType = null

  constructor(
    private localStorage: StorageProvider,
    private auth: AngularFireAuth,
    private afd: AngularFireDatabase

  ) {

  }

  getCurrentUser(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.localStorage.getFromLocalStorage('isyevent_user')
        .then(user => {
          if (user) this.currentUser = user
          else this.currentUser = null

          resolve(user)
        })
        .catch(error => reject(error))
    });
  }

  signUp(credentials): Promise<any> {
    return new Promise((resolve, reject) => {
      this.auth.auth.createUserWithEmailAndPassword(credentials.email, credentials.password)
        .then(res => {

          this.currentUser = {
            name: credentials.name,
            email: credentials.email,
            id: res.uid,
            events: []
          }

          this.localStorage.setToLocalStorage('isyevent_user', this.currentUser)

          this.afd.object(`users/${res.uid}`).set(this.currentUser)
            .then(() => resolve(this.currentUser))
            .catch(error => reject(error))

        })
        .catch(error => reject(error))

    });
  }

  signIn(credentials): Promise<any> {
    return new Promise((resolve, reject) => {
      this.auth.auth.signInWithEmailAndPassword(credentials.email, credentials.password)
        .then(res => {
          this.afd.object(`users/${res.uid}`).valueChanges().take(1).subscribe((user: userType) => {
            this.currentUser = user
            this.localStorage.setToLocalStorage('isyevent_user', this.currentUser)

            resolve()
          })
        })
        .catch(error => reject(error))
    });
  }

  getAllUsersObsvr() {
    return <Observable<userType[]>>this.afd.list('users').valueChanges()
  }

  createNewEvent(event: eventType, userID): Promise<any> {
    return new Promise((resolve, reject) => {
      event.id = this.afd.createPushId()

      this.afd.object(`users/${userID}/events/${event.id}`).set(event)
        .then(() => resolve())
        .catch(error => reject(error))
    });
  }

  getEvents(userID) {
    return <Observable<eventType[]>>this.afd.list(`events/${userID}`).valueChanges()
  }
}
