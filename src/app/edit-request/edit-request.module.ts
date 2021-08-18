import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditRequestPageRoutingModule } from './edit-request-routing.module';

import { EditRequestPage } from './edit-request.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    EditRequestPageRoutingModule
  ],
  declarations: []
})
export class EditRequestPageModule {}
