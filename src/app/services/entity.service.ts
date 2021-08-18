import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import {
  Events, NavController, MenuController, Platform, IonRouterOutlet,
  ActionSheetController, PopoverController, ModalController, ToastController, AlertController
} from '@ionic/angular';
import { Router } from '@angular/router';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Market } from '@ionic-native/market/ngx';
import { AlertService } from './alert.service';
import { FCM } from '@ionic-native/fcm/ngx';
import { LoadingService } from './loader.service';

@Injectable({
  providedIn: 'root'
})

export class EntityService {
  // baseUrl: string = 'http://rakthadaanbharathi.org/sevaBharati/'; //'http://182.18.157.28:9818/sevaBharati/'; // live
  // baseUrl: string = 'http://192.168.20.185:9818/sevaBharati/'; // dev
  baseUrl: string = 'http://202.153.37.85/sevaBharati/'; // dev live
  baseUrlMaster: string = 'http://202.153.37.85/masters/';


  isLoggedIn = false;
  token: any; tenant = ''; jwt = ''; userId = 0; userName = ''; upgradeReq: boolean = false;
  httpOptions: {}; islogout = false; 
  //fcmTopic: string = 'Rakth';//for Dev 
  fcmTopic: string = 'Rakthadaan';//for Prod

  constructor(private http: HttpClient,
    public storage: NativeStorage,
    private platform: Platform,
    private navCtrl: NavController,
    private menu: MenuController,
    private router: Router,
    private alertService: AlertService,
    public toastCtrl: ToastController,
    private actionSheetCtrl: ActionSheetController,
    private popoverCtrl: PopoverController,
    public modalCtrl: ModalController,
    private toast: ToastController,
    private appVersion: AppVersion,
    public alertController: AlertController,
    private market: Market,
    private fcm: FCM,
    public loadingServ: LoadingService) {

    this.platform.ready().then(() => {
      // this.checkVersion();
        let user = JSON.parse(localStorage.getItem('user'));
        this.jwt = localStorage.getItem('user') ? user.data.jwt : '';
      this.httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', Authorization: this.jwt }) };
    });
  }


  getData(apiMethod) {
    return this.http.get(`${this.baseUrl}nojwt/${apiMethod}`, this.httpOptions).toPromise();
  }

  // ******************* Get Methods ****************//
  couchEntities(entityName: string) {
    return this.http.get(`${this.baseUrl}nojwt/CouchEntities/${entityName}`, this.httpOptions).toPromise();
  }

  checkUserAvailability(tenent, entityName) {
    return this.http.get(`${this.baseUrl}nojwt/checkUserAvailability/${entityName}?tenant=${tenent}`, this.httpOptions).toPromise();
  }

  checkMobileAvailability(bundle, id) {
    return this.http.get(`${this.baseUrl}nojwt/mobileexistcheck/${bundle}/${id}`, this.httpOptions).toPromise();
  }

  pagination(entityName, pageNum, size) {
    return this.http.get(`${this.baseUrl}jwt/pagination/${entityName}/${pageNum}/${size}`, this.httpOptions).toPromise();
  }

  logout() {
    return this.http.get(`${this.baseUrl}jwt/logout/`, this.httpOptions).pipe(
      tap(data => {
        this.httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', Authorization: '' }) };
        this.storage.remove("token");
        this.isLoggedIn = false;
        delete this.token;
        this.stopNotifications();
        return data;
      })
    )
  }

  get(entityName, param) {
    return this.http.get(`${this.baseUrl}jwt/${entityName}/${param}`, this.httpOptions).toPromise();
  }

  forget(tenent, entityName, param) {
    return this.http.get(`${this.baseUrl}nojwt/${entityName}/${param}?tenant=${tenent}`, this.httpOptions).toPromise();
  }

  loadget(entityName) {
    return this.http.get(`${this.baseUrl}nojwt/${entityName}`, this.httpOptions).toPromise();
  }

  // ******************* Post Methods ****************//

  SaveRegistration(tenent, bundle) {
    return this.http.post(`${this.baseUrl}nojwt/crud/Member/save?tenant=${tenent}`, bundle, this.httpOptions);
  }

  SaveForm(tenent, bundle) {
    return this.http.post(`${this.baseUrl}nojwt/plasma/save?tenant=${tenent}`, bundle);
  }

  findById(entityName, bundle) {
    return this.http.post(`${this.baseUrl}jwt/crud/${entityName}/findById`, bundle, this.httpOptions).toPromise();
  }

  findAll(entityName, bundle: any = {}) {
    return this.http.post(`${this.baseUrl}jwt/crud/${entityName}/findAll`, bundle, this.httpOptions).toPromise();
  }

  nojwtfindAll(entityName, bundle: any = {}) {
    return this.http.post(`${this.baseUrl}nojwt/crud/${entityName}/findAll`, bundle, this.httpOptions).toPromise();
  }

  onSave(entityName, bundle) {
    return this.http.post(`${this.baseUrl}jwt/crud/${entityName}/save`, bundle, this.httpOptions);
  }

  noJwtSave(entityName, bundle) {
    return this.http.post(`${this.baseUrl}nojwt/crud/${entityName}/save`, bundle, this.httpOptions).toPromise();
  }

  deleteByIds(entityName, bundle) {
    return this.http.post(`${this.baseUrl}jwt/crud/${entityName}/deleteByIds`, bundle, this.httpOptions);
  }

  Login(tenant, bundle) {
    if (this.upgradeReq) {
      this.loadingServ.dismiss();
      this.upgradeAlert();
      return;
    }
    return this.http.post(`${this.baseUrl}nojwt/appLogin?tenant=${tenant}`, bundle, this.httpOptions).pipe(
      tap(token => {
        this.storage.setItem('token', token)
          .then(
            () => {
              console.log('Token Stored');
            },
            error => console.error('Error storing item', error)
          );
        // this.token = token;
        this.isLoggedIn = true;
        return token;
      }),
    );
  }

  LocalPost(api, bundle) {
    return this.http.post(`http://10.10.10.151:9818/sevaBharati/nojwt/${api}`, bundle, this.httpOptions).toPromise();
  }
  //   changePassword(bundle) {
  //     return this.http.post({ apiMethod: `cp/`, formData: bundle, tagType: true }, 1).toPromise();
  //   }

  getToken() {
    return this.storage.getItem('user').then(
      data => {
        this.token = data;
        this.userId = this.token.data.id;
        this.userName = this.token.data.loginName;
        this.jwt = this.token.data.jwt;
        this.tenant = this.token.data.stateID == 2 ? 'AP' : 'Telangana';
        this.httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', Authorization: this.jwt }) };

        if (this.token != null) {
          this.isLoggedIn = true;
          this.getNotifications();
        } else {
          this.isLoggedIn = false;
        }
      },
      error => {
        this.token = null;
        this.isLoggedIn = false;
      }
    );
  }

  post(api, bundle, httpOptions?) {
    return this.http.post(`${this.baseUrl}jwt/domain/${api}`, bundle, httpOptions?httpOptions:this.httpOptions).toPromise();
  }

  changePassword(bundle) {
    return this.http.post(`${this.baseUrl}jwt/cp/`, bundle, this.httpOptions).toPromise();
  }

  // ***************** FireBase ********************

  async getNotifications() {
    this.fcm.getToken().then(token => {
      console.log(token);
      this.SaveNotificationID(token);
    });
    //function to refresh the FCM token.

    this.fcm.onTokenRefresh().subscribe(token => {
      console.log(`refresh: ${token}`);
      this.SaveNotificationID(token);
    });
    //function to receive a push notification from Firebase Cloud Messaging (FCM).

    this.fcm.onNotification().subscribe(data => {
      console.log(data);
      if (data.wasTapped) {
        console.log('Received in background');
        if (data.route)
          this.router.navigate([data.route]);
      } 
      else {
        console.log('Received in foreground');
        this.alertService.customToast(data.body);
        //this.alertService.customToast('Someone raised Request, Check your Accept Request Once');
        //// this.router.navigate([data.landing_page, data.price]);
      }
    });

    this.fcm.subscribeToTopic(this.fcmTopic).then(res => {
      console.log('Subscribed!');
    });

  }

  async stopNotifications() {
    this.fcm.unsubscribeFromTopic(this.fcmTopic);
  }

  async SaveNotificationID(fcmToken: any) {
    let entity = { loginName: this.userName, mobileNotificationID: fcmToken };
    await this.post(`updateNotificationID`, entity).catch((err: HttpErrorResponse) => {
      this.alertService.presentToast('An error occurred while processing your request');
      return;
    }).
      then((res: any) => {
        if (res) {
          let result = res;
        }
      });
  }

  // ************* Alert *************//

  async upgradeAlert() {
    const alert = await this.alertController.create({
      message: 'Please Upgrade to latest version',
      backdropDismiss: false,
      buttons: [{ text: 'Ok', handler: () => { this.market.open('com.dhanush.rakthadaan'); } },],
    });
    await alert.present();
  }

  saveFormNew(api, bundle) {
    return this.http.post(`${this.baseUrl}${api}`, bundle, { headers: new HttpHeaders({ Authorization: this.jwt }) }).toPromise();
  }

  getAllPurpose(api){
    return this.http.get(`${this.baseUrlMaster}nojwt/${api}`).toPromise();
  }

  findAllBloodGroup(api, bundle){
    return this.http.post(`${this.baseUrl}nojwt/${api}`, bundle, this.httpOptions).toPromise();
  }

}