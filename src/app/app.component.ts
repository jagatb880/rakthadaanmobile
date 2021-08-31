import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthService } from './services/auth.service';
import { AlertService } from './services/alert.service';
import { EntityService } from './services/entity.service';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Component, OnInit, ViewEncapsulation, ViewChildren, QueryList } from '@angular/core';
import { Events, NavController, MenuController, Platform, IonRouterOutlet, ActionSheetController, PopoverController, ModalController, LoadingController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { LoadingService } from './services/loader.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { AlertController } from '@ionic/angular';
import { Market } from '@ionic-native/market/ngx';
import { HttpErrorResponse } from '@angular/common/http';
import { Network } from '@ionic-native/network/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Location } from '@angular/common';
import { WebIntent } from '@ionic-native/web-intent/ngx';

declare var intentShim: any
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})

export class AppComponent implements OnInit {

  @ViewChildren(IonRouterOutlet) routerOutlets: QueryList<IonRouterOutlet>;

  lastTimeBackPress = 0;
  timePeriodToExit = 2000; 
  isLoggedOut: boolean = false; contactNumb = '';

  public appPages = [
    {
      title: 'Blood/Platelets Request',
      url: '/request',
      icon: 'create'
    },
    {
      title: 'My Requests',
      url: '/accepted',
      icon: 'eye'
    },
    {
      title: 'Accept Request',
      url: '/donationrequest',
      icon: 'notifications'
    },
    {
      title: 'Edit Profile',
      url: '/edit-profile',
      icon: 'document'
    },
    {
      title: 'Change Password',
      url: '/change-password',
      icon: 'key'
    },
    {
      title: 'Suggestion',
      url: '/suggestion',
      icon: 'paper'
    },
    {
      title: 'Notifications',
      url: '/notifications',
      icon: 'notifications'
    },
  ];
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private entityService: EntityService,
    private navCtrl: NavController,
    private alertService: AlertService,
    private storage: NativeStorage,
    private menu: MenuController,
    private router: Router,
    public toastCtrl: ToastController,
    private actionSheetCtrl: ActionSheetController,
    public modalCtrl: ModalController,
    private toast: ToastController,
    public loadingServ: LoadingService,
    private appVersion: AppVersion,
    public alertController: AlertController,
    private market: Market,
    public network: Network,
    private socialSharing: SocialSharing,
    private location: Location,
    private popoverController: PopoverController,
    private loadingController: LoadingController,
    private webIntent: WebIntent,
  ) {
    this.initializeApp();
    this.getContactDetails();
    this.entityService.getNotifications();
    setTimeout(()=>{this.checkVersion()}, 2000);
  }

  ngOnInit() {

  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.show();
      this.splashScreen.hide();
        this.entityService.getToken().then(() => {
          if (this.entityService.isLoggedIn) {
            this.navCtrl.navigateRoot('/dashboard');
          }
        });
        this.backButtonEvent();
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
            }else{
              debugger;
              let exsitingMobileNo = userStatus.data.mobile;
              let parseData = JSON.parse(intent.extras.loginData)
              let currentMobileNo = parseData.mobile
              if(exsitingMobileNo != currentMobileNo)
              {
                const alert = await this.alertController.create({
                  message: "You have already loged in different account: "+ exsitingMobileNo +". Please logout and try with this account: "+currentMobileNo,
                  buttons: [
                    {
                      text: 'Cancel',
                      role: 'cancel',
                      cssClass: 'secondary',
                      handler: (blah) => {
                        console.log('Confirm Cancel: blah');
                      }
                    }, {
                      text: 'Okay',
                      handler: () => {
                        this.logout()
                      }
                    }
                  ]
                });
                await alert.present();
              }
            }
          }
        },
        err => {
          console.log('Error', err);
        });
        // (<any>window).plugins.intentShim.getIntent(
        // function (intent) {
        //   alert("hi2")
        //   alert("h2intent"+JSON.stringify(intent));
        //   alert("h2getIntent() :" + JSON.stringify(intent.extras));
        // },
        // function () {
        //   alert('Error getting intent');
        // });
    });
  }

  logout() {
    this.loadingServ.present();
    this.entityService.SaveNotificationID('').then(() => {
    localStorage.clear()
    this.entityService.logout().subscribe(
      data => {
        // this.alertService.presentToast(data['message']);
        this.loadingServ.dismiss();
        this.navCtrl.navigateRoot('/login');
      },
      error => {
        this.loadingServ.dismiss();
        this.navCtrl.navigateRoot('/login');
      },
      () => {
        this.loadingServ.dismiss();
        this.navCtrl.navigateRoot('/login'); //landing
      }
    );
  });
  }

  backButtonEvent() {
    this.platform.backButton.subscribe(async () => {
      // const element = await this.modalCtrl.getTop();
      // const popelement = await this.popoverController.getTop();
      // const menuelement = await this.menu.getOpen();
      // const loadelement = await this.loadingController.getTop();
      // if (loadelement) {
      //   loadelement.dismiss();
      // }else if (menuelement) {
      //   this.menu.close();
      // } else if (element) {
      //   element.dismiss();
      // } else if (popelement) {
      //   popelement.dismiss();
      // } else 
      if (this.router.isActive('/login', true) || this.router.isActive('/dashboard', true)) {
          if (new Date().getTime() - this.lastTimeBackPress < this.timePeriodToExit) {
            // this.platform.exitApp(); // Exit from app
            navigator['app'].exitApp(); // work for ionic 4
          }
          else {
            this.alertService.presentToast('Press back again to exit App.');
            this.lastTimeBackPress = new Date().getTime();
          }
        } else {
          this.location.back();
        }
      
    });
  }

  async checkVersion() {
    this.platform.ready().then(() => {
      let type = this.network.type;

      if(type != "unknown" || this.network.type != "none" || type != undefined){
        this.appVersion.getVersionNumber().then((res)=>{
          let appVers = res;
          this.entityService.loadget(`checkVersion/${appVers}`).catch((err: HttpErrorResponse) => {
            let respons = err.error;
            if(respons.status == 'UPGRADE_REQUIRED') {
              this.upgradeAlert(`${respons.message}`);
              this.entityService.upgradeReq = true;
              this.entityService.islogout = true;
              if (this.entityService.isLoggedIn) this.logout(); 
            }
            else if(respons.status == 'ACCEPTED') 
            this.presentAlert(`${respons.message}`);
            else
            this.alertService.presentToast('An error occurred while processing your request');
            return;
          }).then((resp: any) => {
            if (resp) {
              if(resp.status != 'OK') {
                if(resp.status == 'UPGRADE_REQUIRED') {
                  this.upgradeAlert(`${resp.message}`);
                  this.entityService.islogout = true;
                  if (this.entityService.isLoggedIn) this.logout(); 
                }
                else
                this.presentAlert(`${resp.message}`);
              }
            }
          });
         }, (err)=>{
          console.log(err); 
         });
        }
        else
        this.alertService.presentToast('No network access, please check network connection');
    });
  }

  async getContactDetails() {
    this.entityService.loadget('getConfiguration/supportNumber').catch((err: HttpErrorResponse) => {
      this.alertService.presentToast(`An error occurred while processing your request`); 
      return;
   }).then((res: any) => {
     if (res) {
      this.contactNumb = res.data;
     }
   });
  }

  async presentAlert(msg: string) {
    const alert = await this.alertController.create({
      message: msg,
      buttons: [{text: 'Update',handler: () => { this.market.open('com.dhanush.rakthadaan');}},
      {text: 'Ok'},],
    });
    await alert.present();
  }

  async upgradeAlert(msg: string) {
    const alert = await this.alertController.create({
      message: msg,
      backdropDismiss: false,
      buttons: [{text: 'Ok',handler: () => { this.market.open('com.dhanush.rakthadaan');}},],
    });
    await alert.present();
  }

  async contactAlert() {
    const alert = await this.alertController.create({
      message: `For any Help, Contact us ${this.contactNumb}`,
      backdropDismiss: false,
      buttons: [{text: 'Ok'}],
    });
    await alert.present();
  }

  async share(){
    var options = {
       message: 'Rakthadaan',
       url: 'https://play.google.com/store/apps/details?id=com.dhanush.rakthadaan',
   };
    this.socialSharing.shareWithOptions(options);
  }

}