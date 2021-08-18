import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SuggestionPageRoutingModule } from './suggestion-routing.module';

import { SuggestionPage } from './suggestion.page';
import { AddSuggestionPage } from 'src/app/pages/suggestions/add-suggestion/add-suggestion.page';
import { AddSuggestionPageModule } from 'src/app/pages/suggestions/add-suggestion/add-suggestion.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SuggestionPageRoutingModule,
    AddSuggestionPageModule
  ],
  declarations: [SuggestionPage],
  entryComponents: [AddSuggestionPage]
})
export class SuggestionPageModule {}
