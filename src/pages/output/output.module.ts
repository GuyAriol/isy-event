import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OutputPage } from './output';

@NgModule({
  declarations: [
    OutputPage,
  ],
  imports: [
    IonicPageModule.forChild(OutputPage),
  ],
})
export class OutputPageModule {}
