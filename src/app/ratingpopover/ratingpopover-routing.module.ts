import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RatingpopoverPage } from './ratingpopover.page';

const routes: Routes = [
  {
    path: '',
    component: RatingpopoverPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RatingpopoverPageRoutingModule {}
