import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddSuggestionPageRoutingModule } from './add-suggestion-routing.module';

import { AddSuggestionPage } from './add-suggestion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AddSuggestionPageRoutingModule
  ],
  declarations: [AddSuggestionPage],
  exports: [AddSuggestionPage]
})
export class AddSuggestionPageModule {}
