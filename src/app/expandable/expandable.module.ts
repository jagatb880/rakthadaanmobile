import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExpandablePageRoutingModule } from './expandable-routing.module';

import { ExpandablePage } from './expandable.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExpandablePageRoutingModule
  ],
  declarations: []
})
export class ExpandablePageModule {}
