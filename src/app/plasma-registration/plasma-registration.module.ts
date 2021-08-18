import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlasmaRegistrationPageRoutingModule } from './plasma-registration-routing.module';

import { PlasmaRegistrationPage } from './plasma-registration.page';
import { PlasmaTermsPage } from '../plasma-terms/plasma-terms.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    PlasmaRegistrationPageRoutingModule
  ],
  declarations: [PlasmaRegistrationPage],
  entryComponents : [PlasmaRegistrationPage]
})
export class PlasmaRegistrationPageModule {}
