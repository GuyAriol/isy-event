import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SuperAdminPage } from './super-admin';

@NgModule({
  declarations: [
    SuperAdminPage,
  ],
  imports: [
    IonicPageModule.forChild(SuperAdminPage),
  ],
})
export class SuperAdminPageModule {}
