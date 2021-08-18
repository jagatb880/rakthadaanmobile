import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { NotePage } from './note/note.page';
import { NotePageModule } from './note/note.module';
import { LoadingService } from './services/loader.service';
import { PopoverPage } from './popover/popover.page';
import { PopoverPageModule } from './popover/popover.module';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Market } from '@ionic-native/market/ngx';
import { Network } from '@ionic-native/network/ngx';
import { FCM } from '@ionic-native/fcm/ngx';
import { RatingpopoverPage } from './ratingpopover/ratingpopover.page';
import { RatingpopoverPageModule } from './ratingpopover/ratingpopover.module';
import { PlasmaRegistrationPageModule } from 'src/app/plasma-registration/plasma-registration.module';
import { SearchPipe } from './pages/suggestions/search.pipe';
import { LoginPageModule } from 'src/app/pages/auth/login/login.module';
import { RequestPageRoutingModule } from 'src/app/pages/request/request-routing.module';
import { AddSuggestionPageModule } from 'src/app/pages/suggestions/add-suggestion/add-suggestion.module';
import { PlasmaTermsPageModule } from "src/app/plasma-terms/plasma-terms.module"

@NgModule({
  declarations: [AppComponent, SearchPipe],
  entryComponents: [NotePage, PopoverPage, RatingpopoverPage],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NotePageModule,
    PopoverPageModule,
    RatingpopoverPageModule,
    AddSuggestionPageModule,
    PlasmaRegistrationPageModule,
    PlasmaTermsPageModule
  ],
  providers: [DatePipe, StatusBar, SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    NativeStorage, NavController, LoadingService, AppVersion, Market, Network, FCM, SocialSharing
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
