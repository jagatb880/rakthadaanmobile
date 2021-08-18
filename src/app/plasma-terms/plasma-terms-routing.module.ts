import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlasmaTermsPage } from './plasma-terms.page';

const routes: Routes = [
  {
    path: '',
    component: PlasmaTermsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlasmaTermsPageRoutingModule {}
