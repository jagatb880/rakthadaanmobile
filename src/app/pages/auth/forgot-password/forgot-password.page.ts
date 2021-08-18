import { Component, OnInit } from '@angular/core';
import { ModalController, NavController, MenuController, LoadingController, Platform } from '@ionic/angular';
import { RegisterPage } from '../register/register.page';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { EntityService } from '../../../services/entity.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Base } from '../../../Base';
import { Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { HttpErrorResponse } from '@angular/common/http';
import { LoadingService } from '../../../services/loader.service';
import { Network } from '@ionic-native/network/ngx';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage extends Base implements OnInit {

  resetForm= new FormGroup({}); subscription : any; online: boolean = false;
  mobilePattern = "^([+][9][1]|[9][1]|[0]){0,1}([6-9]{1})([0-9]{9})$";
  constructor(protected entityService: EntityService,
    private fb: FormBuilder,
    protected router: Router,
    private modalController: ModalController,
    private authService: AuthService,
    private navCtrl: NavController,
    public alertService: AlertService,
    protected storage: NativeStorage,
    protected menu: MenuController,
    public loadingController: LoadingController,
    public loadingServ: LoadingService,
    public platform: Platform,
    public network: Network) {
    super(entityService, router,storage,menu,loadingController, network,platform,alertService);

    this.resetForm = this.fb.group({
      userName:['',[Validators.required,Validators.pattern(this.mobilePattern)]],
      stateID:['',[Validators.required]]
    });

    this.platform.ready().then(() => {
      if (this.platform.is('hybrid')) {
        let type = this.network.type;
        if (type == "unknown" || type == "none" || type == undefined) {
          this.online = false;
          alertService.presentToast('No network access, please check network connection');
        } else 
          this.online = true;
      }
      else
      this.online = true;
    });

    this.network.onDisconnect().subscribe( () => {
      this.online = false;
      alertService.presentToast('No network access, please check network connection');
      //console.log('network was disconnected :-(');
    });

    this.network.onConnect().subscribe( () => {
      this.online = true;
      //console.log('network was connected :-)');
    });
    
  };

  ngOnInit() {
  }

  get f() { return this.resetForm.controls; }

  ionViewWillEnter() {
    if(this.online)
    this.LoadStates();
    else
    this.alertService.presentToast('No network access, please check network connection');
  }

   dismissReset() {
    this.modalController.dismiss();
  }

  async onReset() {
    if(this.online) {
    this.loadingServ.present();
    this.entityName='resetPassword';
    this.entityService.forget(this.resetForm.get('stateID').value == 2 ? 'AP' : 'Telangana',this.entityName,this.resetForm.get('userName').value.trim()).catch((err: HttpErrorResponse) => {
      this.loading.dismiss(), this.alertService.presentToast(`An error occurred while processing your request`); 
      return;
    }).
    then((res: any) => {
      if (res) {
        this.loadingServ.dismiss();
        this.alertService.presentToast(res['message']);
      this.resetForm.reset();
      }
      else
      this.loadingServ.dismiss(), this.alertService.presentToast(`An error occurred while processing your request`); 
    });
  }
  else
  this.alertService.presentToast('No network access, please check network connection');
  }

  LoadStates() {
    // this.loading = true;
    this.entityService.loadget('supportedStates').catch((err: HttpErrorResponse) => {
       this.alertService.presentToast(`An error occurred while processing your request`); 
       return;
    }).then((res: any) => {
      // this.loading = false;
      if (res.status == 'OK'){
        this.stateList = res.data;
      }
    });
  }

  ionViewDidEnter() {
    this.subscription = this.platform.backButton.subscribe(() => {
      this.dismissReset();
    });
  }

  ionViewWillLeave() {
    this.subscription.unsubscribe();
  }

  goBack() {
    this.dismissReset();
  }

}
