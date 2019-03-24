import { Injectable } from '@angular/core';
import { langFR, langExprType } from '../global';


@Injectable()
export class LanguageProvider {

  language = 'fr'
  languageLong = 'Français'
  icon = 'assets/imgs/french.png'
  expr: langExprType = langFR


}
