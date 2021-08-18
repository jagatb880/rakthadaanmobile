import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DonationrequestPage } from './donationrequest.page';

const routes: Routes = [
  {
    path: '',
    component: DonationrequestPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DonationrequestPageRoutingModule {}
