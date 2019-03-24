import { Injectable } from '@angular/core';
import { AlertController, LoadingController, ToastController } from 'ionic-angular';
import { LanguageProvider } from '../language/language';
import { global } from '../global';

@Injectable()
export class DialogProvider {

  loader

  constructor(
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private langProv: LanguageProvider

  ) {

  }

  /** Show loding spinner
   *
   * @param {any} content
   * @param {number} timeout
   * @memberof DialogProvider
   */
  showLoading(content: string, timeout: number) {
    if (global.isDebug) {
      console.log('--DialogProvider-showLoading');
    }

    this.loader = this.loadingCtrl.create({
      content: content,
      spinner: "circles",
      dismissOnPageChange: false
    });

    try {
      this.loader.present()
    } catch (error) {
      if (global.isDebug) {
        console.log(error);
      }
    }

    // set time out for the loading view
    setTimeout(() => {
      try {
        this.loader.dismiss()
      } catch (error) {
        if (global.isDebug) {
          console.log(error);
        }
      }
    }, timeout)
  }

  /** Dismiss loading spinner
   *
   * @memberof DialogProvider
   */
  dismissLoading() {
    if (global.isDebug) {
      console.log('--DialogProvider-dismissLoading');
    }

    try {
      this.loader.dismiss()
    } catch (error) {
      console.log(error);

    }
  }

  /** Show simple alert pop up
   *
   * @param {any} title
   * @param {any} subtitle
   * @param {any} message
   * @param {any} buttonText
   * @memberof DialogProvider
   */
  showSimpleDialog(title, subtitle, message, buttonText, css?) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: subtitle,
      message: message,
      buttons: [{
        text: buttonText,
        handler: () => {

        }
      }
      ],
      cssClass: css ? css : 'alertCSS'
    });
    alert.present()
      .catch(error => {
        if (global.isDebug) {
          console.log(error);
        }
      })
  }

  /** Handle authentification erros and display them in alert
   *
   * @param {any} error
   * @param {any} title
   * @memberof DialogProvider
   */
  authentificationErrorDlg(error, title, css?) {
    let errorMessage;

    if (error.code == 'auth/argument-error') errorMessage = this.langProv.expr.wrongInput

    else if (error.code == 'auth/email-already-in-use') errorMessage = this.langProv.expr.emailInUse

    else if (error.code == 'auth/network-request-failed') errorMessage = this.langProv.expr.noConnection;

    else if (error.code == 'auth/invalid-email') errorMessage = this.langProv.expr.wrongEmail

    else if (error.code == 'auth/weak-password') errorMessage = this.langProv.expr.passwordMinLength

    else if (error.code == 'auth/wrong-password') errorMessage = this.langProv.expr.wrongPassword

    else if (error.code == 'auth/user-not-found') errorMessage = this.langProv.expr.noEmail


    // diplay the error
    this.showSimpleDialog('', title, errorMessage, 'Ok', css ? css : '')
  }

  showToast(message, duration?, position?, css?) {
    this.toastCtrl.create({
      message: message,
      duration: duration ? duration : 3000,
      position: position ? position : 'bottom',
      cssClass: css ? css : 'toast'
    }).present()
      .catch(error => {
        if (global.isDebug) {
          console.log(error);
        }
      })
  }
}
