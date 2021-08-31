import { Component, OnInit } from '@angular/core';
import { MenuController, NavController, AlertController, Platform } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { WebIntent } from '@ionic-native/web-intent/ngx';
import { EntityService } from 'src/app/services/entity.service';
import { LoadingService } from 'src/app/services/loader.service';
// import { User } from 'src/app/models/user';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  // user: User;

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
  ];
  constructor(private menu: MenuController, private authService: AuthService, private navCtrl: NavController, private alertController: AlertController,private webIntent: WebIntent,
    public loadingServ: LoadingService,private entityService: EntityService, private platform: Platform) { 
    this.menu.enable(true);
    this.platform.resume.subscribe(() => {

      this.checkAppStatus(); //i am calling this method while app running in background or sleep
      
      });
  }

  ngOnInit() {
    
  }

  checkAppStatus(){
    this.webIntent.getIntent().then(async (intent: any) => {
      if(intent.extras != undefined){
        console.log(intent.extras.loginData)
        let userStatus: any = await JSON.parse(localStorage.getItem('user'));
        debugger
        if(userStatus != undefined){
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
  }

  goToPage(url){
    this.navCtrl.navigateForward([url]);
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
}