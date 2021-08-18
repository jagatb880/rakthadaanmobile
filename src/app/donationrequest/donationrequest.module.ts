import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DonationrequestPageRoutingModule } from './donationrequest-routing.module';

import { DonationrequestPage } from './donationrequest.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DonationrequestPageRoutingModule
  ],
  declarations: [DonationrequestPage],
  
})
export class DonationrequestPageModule {}
