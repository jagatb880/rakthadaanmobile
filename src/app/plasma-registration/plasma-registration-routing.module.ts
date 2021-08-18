import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlasmaRegistrationPage } from './plasma-registration.page';

const routes: Routes = [
  {
    path: '',
    component: PlasmaRegistrationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlasmaRegistrationPageRoutingModule {}
