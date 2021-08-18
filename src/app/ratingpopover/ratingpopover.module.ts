import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RatingpopoverPageRoutingModule } from './ratingpopover-routing.module';

import { IonicRatingModule } from 'ionic4-rating';
import { RatingpopoverPage } from './ratingpopover.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    IonicRatingModule,
    RatingpopoverPageRoutingModule
  ],
  declarations: [RatingpopoverPage],
  entryComponents:[RatingpopoverPage]
})
export class RatingpopoverPageModule {}
