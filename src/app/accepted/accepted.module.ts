import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AcceptedPageRoutingModule } from './accepted-routing.module';

import { AcceptedPage } from './accepted.page';
import { ExpandablePage } from '../expandable/expandable.page'
import { RouterModule } from '@angular/router';
import { EditRequestPage } from '../edit-request/edit-request.page';
import { IonicRatingModule } from 'ionic4-rating';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AcceptedPageRoutingModule,
    IonicRatingModule,
    RouterModule.forChild([
      {
        path: "",
        component: ExpandablePage
      }
    ])
  ],
  declarations: [AcceptedPage, ExpandablePage, EditRequestPage],
  entryComponents: [EditRequestPage]
})
export class AcceptedPageModule {}
