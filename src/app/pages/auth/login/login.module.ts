import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginPageRoutingModule } from './login-routing.module';

import { LoginPage } from './login.page';
import { RegisterPage } from '../register/register.page';
import { ForgotPasswordPage } from '../forgot-password/forgot-password.page';
import { PlasmaRegistrationPage } from 'src/app/plasma-registration/plasma-registration.page';
import { PlasmaTermsPage } from 'src/app/plasma-terms/plasma-terms.page';
import { PlasmaRegistrationPageModule } from 'src/app/plasma-registration/plasma-registration.module';
import { PlasmaTermsPageModule } from 'src/app/plasma-terms/plasma-terms.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    LoginPageRoutingModule,
    PlasmaRegistrationPageModule,
    PlasmaTermsPageModule
  ],
  declarations: [LoginPage, RegisterPage, ForgotPasswordPage],
  entryComponents: [RegisterPage, ForgotPasswordPage, PlasmaRegistrationPage]
})
export class LoginPageModule { }
