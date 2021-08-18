import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RequestPageRoutingModule } from './request-routing.module';

import { RequestPage } from './request.page';
import { PlasmaRegistrationPageModule } from 'src/app/plasma-registration/plasma-registration.module';
import { PlasmaTermsPageModule } from 'src/app/plasma-terms/plasma-terms.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RequestPageRoutingModule,
    PlasmaRegistrationPageModule,
    PlasmaTermsPageModule
  ],
  declarations: [RequestPage],
  entryComponents: [ ]
})
export class RequestPageModule {}
