import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { RegisterPageRoutingModule } from './register-routing.module';

import { RegisterPage } from './register.page';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotePage } from '../../../note/note.page';
import { NotePageModule } from '../../../note/note.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegisterPageRoutingModule,
    ReactiveFormsModule,
    NotePageModule
  ],
  declarations: [],
  exports:[],
  entryComponents : [RegisterPage, NotePage]
})
export class RegisterPageModule {}
