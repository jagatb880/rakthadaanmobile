import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlasmaTermsPageRoutingModule } from './plasma-terms-routing.module';

import { PlasmaTermsPage } from './plasma-terms.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PlasmaTermsPageRoutingModule
  ],
  declarations: [PlasmaTermsPage],
  entryComponents : [PlasmaTermsPage]
})
export class PlasmaTermsPageModule {}
