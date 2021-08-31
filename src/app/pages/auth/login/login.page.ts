import { Component, OnInit } from '@angular/core';
import { ModalController, NavController, Platform, AlertController } from '@ionic/angular';
import { RegisterPage } from '../register/register.page';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { EntityService } from '../../../services/entity.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ForgotPasswordPage } from '../forgot-password/forgot-password.page';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { HttpErrorResponse } from '@angular/common/http';
import { LoadingService } from '../../../services/loader.service';
import { Network } from '@ionic-native/network/ngx';
import { PlasmaRegistrationPage } from 'src/app/plasma-registration/plasma-registration.page';
import { PlasmaTermsPage } from 'src/app/plasma-terms/plasma-terms.page';
import { AppVersion } from '@ionic-native/app-version';
import { WebIntent } from '@ionic-native/web-intent/ngx';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loginForm = new FormGroup({});
  lastTimeBackPress = 0;
  timePeriodToExit = 2000;
  subscription: any; stateList = []; tent = ''; online: boolean = true;
  isOtpShow: boolean = true; pass = ''; userName = ''; otp = ''; isTimerStart: boolean = false;
  mobilePattern = "^([+][9][1]|[9][1]|[0]){0,1}([6-9]{1})([0-9]{9})$"; rakthadaanAppVersion: any = '1.2.12';
  state_Id='';
  // appVersion = new AppVersion();
  constructor(
    private modalController: ModalController,
    private authService: AuthService,
    private navCtrl: NavController,
    private alertService: AlertService,
    private entityService: EntityService,
    private platform: Platform,
    private fb: FormBuilder,
    private storage: NativeStorage,
    private modalCtrl: ModalController,
    public loadingServ: LoadingService,
    public alertController: AlertController,
    public network: Network,
    private webIntent: WebIntent,
  ) {

    this.loginForm = this.fb.group({
      loginName: ['', [Validators.required, Validators.pattern(this.mobilePattern)]],
      password: [''],
      stateID: ['', Validators.required],
      otp: [''],
    });


    this.platform.ready().then(() => {
      if (this.platform.is('hybrid')) {
        let type = this.network.type;
        if (type == "unknown" || type == "none" || type == undefined) {
          this.online = false;
          alertService.presentToast('No network access, please check network connection');
        } else {
          this.online = true;
        }
      }
      else
        this.online = true;
    });

    this.network.onDisconnect().subscribe(() => {
      this.online = false;
      alertService.presentToast('No network access, please check network connection');
      //console.log('network was disconnected :-(');
    });

    this.network.onConnect().subscribe(() => {
      this.online = true;
      //console.log('network was connected :-)');
    });

    if (this.online){
      this.LoadStates();
      this.loginForm.patchValue({stateID:this.state_Id});
    }

    this.platform.resume.subscribe(() => {

      this.checkAppStatus(); //i am calling this method while app running in background or sleep
      
      });

    // this.appVersion.getVersionCode().then(version => {
    //   this.rakthadaanAppVersion = version;
    // });
  }

  ngOnInit() {
  }

  get f() { return this.loginForm.controls; }

  checkAppStatus(){
    this.webIntent.getIntent().then(async (intent: any) => {
      if(intent.extras != undefined){
        console.log(intent.extras.loginData)
        let userStatus: any = await JSON.parse(localStorage.getItem('user'));
        debugger
        if(userStatus == undefined){
          let data:any = {
            data: JSON.parse(intent.extras.loginData)
          }
          localStorage.setItem('user', JSON.stringify(data));
          let user = JSON.parse(localStorage.getItem('user'));
          this.entityService.jwt = user.data.jwt;
          this.entityService.userId = user.data.id;
          this.entityService.tenant = localStorage.getItem('tenant');
          this.entityService.getToken();
        }
      }
    },
    err => {
      console.log('Error', err);
    });

  }
  ionViewWillEnter() {
    if (this.online)
      this.LoadStates(),this.loginForm.patchValue({stateID:this.state_Id});
    else
      this.alertService.presentToast('No network access, please check network connection');
  }

  dismissLogin() {
    this.modalController.dismiss();
  }

  async registerModal() {
    // this.dismissLogin();
    const registerModal = await this.modalController.create({
      component: RegisterPage
    });
    return await registerModal.present();
  }

  async plasmaModal() {
    // this.dismissLogin();
    const plasmaModal = await this.modalController.create({
      component: PlasmaRegistrationPage
    });
    return await plasmaModal.present();
  }

  async forgotPswdModal() {
    // this.dismissLogin();
    const forgotPswdModal = await this.modalController.create({
      component: ForgotPasswordPage
    });
    return await forgotPswdModal.present();
  }

  async onLogin() {
    if (this.online) {
      this.loadingServ.present();
      await this.entityService.Login(this.loginForm.get('stateID').value == 2 ? 'AP' : 'Telangana', `{"loginName":"${this.loginForm.get('loginName').value.trim()}","password":"${this.loginForm.get('password').value}","otp":"${this.otp}"}`).
        subscribe(data => {
          // this.platform.ready().then(() => {
            // 'hybrid' detects both Cordova and Capacitor
          
              // fallback to browser APIs
              console.log('browser');
              localStorage.setItem('tenant', this.loginForm.get('stateID').value == 2 ? 'AP' : 'Telangana');
              localStorage.setItem('user', JSON.stringify(data));
              let user = JSON.parse(localStorage.getItem('user'));
              // let userInfo;
              // this.storage.getItem('token').then(data => { console.log(data), userInfo = data.data.jwt; }, error => console.error(error));
              this.entityService.jwt = user.data.jwt;
              this.entityService.userId = user.data.id;
              this.entityService.tenant = localStorage.getItem('tenant');
              this.loadingServ.dismiss();
              this.entityService.getToken();
              this.navCtrl.navigateRoot('/dashboard');
            
          // });
        },
          error => {
            this.alertService.presentToast("Invalid Credentials");
            this.loadingServ.dismiss();
          }
        );
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
      if (res)
        if (res.status == 'OK') {
          this.stateList = res.data;
          this.state_Id=this.stateList[0].id;
        }
    });
  }

  doRefresh(event) {
    this.LoadStates();
    this.loginForm.reset();
    this.loginForm.patchValue({stateID:this.state_Id});
    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  loginWithOtp(item: any) {
    if (item.detail.checked)
      this.isOtpShow = false, this.pass = '';
    else
      this.isOtpShow = true, this.otp = '';
  }

  async generateOtp() {
    this.timerStart();
    await this.entityService.getData(`genearateotp/${this.userName}?tenant=${this.entityService.tenant}`).
      catch(() => this.alertService.presentToast('Invalid User credentials')).
      then((res: any) => {
        if (res) {
          let result = res;
          if (result.status == 'OK') {
            this.alertService.presentToast(result.message);
          }
        }
      });
  }
  timerStart() {
    var timeLeft = 30;
    //var elem = document.getElementById('timer');
    var timerId = setInterval(countdown, 1000);
    function countdown() {
      if (timeLeft == -1) {
        clearTimeout(timerId);
        this.isTimerStart = false;
      } else {
        // elem.innerHTML = timeLeft + ' ';
        timeLeft--;
        this.isTimerStart = true;
      }
    }
  }

  vlidateSpace(event) {
    event.target.value = event.target.value.replace(/\s/g, "");
  }


}