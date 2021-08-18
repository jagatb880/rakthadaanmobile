import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PopoverPageRoutingModule } from './popover-routing.module';

import { PopoverPage } from './popover.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PopoverPageRoutingModule
  ],
  declarations: [PopoverPage],
  entryComponents:[PopoverPage]
})
export class PopoverPageModule {}
