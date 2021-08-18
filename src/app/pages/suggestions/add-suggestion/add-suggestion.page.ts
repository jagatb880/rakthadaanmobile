import { Component, OnInit } from '@angular/core';
import { EntityService } from 'src/app/services/entity.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController, LoadingController, NavController, Platform, PopoverController, NavParams, AlertController, MenuController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { NgForm } from '@angular/forms';
import { AlertService } from 'src/app/services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { LoadingService } from 'src/app/services/loader.service';
import { Network } from '@ionic-native/network/ngx';
import { DatePipe } from '@angular/common';
import { Market } from '@ionic-native/market/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Base } from 'src/app/Base';

@Component({
  selector: 'app-add-suggestion',
  templateUrl: './add-suggestion.page.html',
  styleUrls: ['./add-suggestion.page.scss'],
})
export class AddSuggestionPage extends Base implements OnInit {

  addSugForm = new FormGroup({});
  
  constructor( protected entityService: EntityService,
    private fb: FormBuilder,
    private navCtrl: NavController,
    protected router: Router,
    private datePipe: DatePipe,
    public alertService: AlertService,
    protected storage: NativeStorage,
    protected menu: MenuController,
    public loadingController: LoadingController,
    public platform: Platform,
    private modalController: ModalController,
    public loadingServ: LoadingService,
    private appVersion: AppVersion,
    public alertController: AlertController,
    private market: Market,
    public network: Network,
    public navParams: NavParams) {
    super(entityService, router, storage, menu, loadingController, network, platform, alertService); 
    this.suggformInit();
  }

  ngOnInit() {
  }

  get f() { return this.addSugForm.controls; }

async save(){
    if (this.online) {
      let error;
      let user : any = this.entityService.token;
      this.addSugForm.patchValue({
        user: {id: +user.data.id}
      });
      let entity = this.addSugForm.value;
      this.loadingServ.present();
      await this.entityService.noJwtSave('Suggestion', entity).catch((err: HttpErrorResponse) => {
        error = err.error; this.loadingServ.dismiss();
        if (err.status == 401) {
          localStorage.clear();
          this.storage.remove("token");
          this.alertService.presentToastmiddle(`Session Expired`);
          this.navCtrl.navigateRoot('/');
          return;
        }
        else
           this.alertService.presentToast(`${error.message}`);
        return;
      }).
        then((res: any) => {
          if (res) {
            this.loadingServ.dismiss();
            let result = res;
            this.alertService.presentToast(`${result.message}`);
            this.goBack();
          }
          else
             this.loadingServ.dismiss(), this.alertService.presentToast(`${error.message}`);
        });
    }
     else
       this.alertService.presentToast('No network access, please check network connection');
  }

 suggformInit() {
    this.addSugForm = this.fb.group({
      suggest: ['', Validators.required],
      user: {
        id: [0]
        }
    });
  }
  goBack() {
    this.modalController.dismiss();
  }
}
