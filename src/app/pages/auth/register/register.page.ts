
import { Component, OnInit } from '@angular/core';
import { EntityService } from '../../../services/entity.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController, LoadingController, NavController, Platform } from '@ionic/angular';
import { LoginPage } from '../login/login.page';
import { AuthService } from 'src/app/services/auth.service';
import { NgForm } from '@angular/forms';
import { AlertService } from 'src/app/services/alert.service';
import { MustMatch } from '../../../validators/mustmatch';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { NotePage } from '../../../note/note.page';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { LoadingService } from '../../../services/loader.service';
import { Network } from '@ionic-native/network/ngx';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  regForm = new FormGroup({});

  districtList: any[] = []; mandalList: any[] = []; subscription: any; stateList = []; organizationList: any[] = [];
  item: IList[]; entityName: any; roleEntity = {}; loading: any; online: boolean = false; validMobile: boolean = false;
  master: any = {
    'GenderMaster': this.item,
    // 'StateMaster': this.item,
  };

  bloodgrps = [{ name: 'A-' }, { name: 'A+' }, { name: 'B-' }, { name: 'B+' }, { name: 'O+' }, { name: 'O-' }, { name: 'AB+' }, { name: 'AB-' }, { name: 'No Idea' }];
  mobilePattern = "^([+][9][1]|[9][1]|[0]){0,1}([6-9]{1})([0-9]{9})$";

  constructor(
    protected entityService: EntityService,
    private fb: FormBuilder,
    protected router: Router,
    private modalController: ModalController,
    private authService: AuthService,
    private navCtrl: NavController,
    public alertService: AlertService,
    public loadingController: LoadingController,
    private platform: Platform,
    private storage: NativeStorage,
    public loadingServ: LoadingService,
    public network: Network,
    private datePipe: DatePipe) {

    for (const item of Object.keys(this.master)) {
      this.entityName = item.replace(/_/g, ' ');
      this.couchEntities();
    }

    this.platform.ready().then(() => {
      if (this.platform.is('hybrid')) {
        let type = this.network.type;

        if (type == "unknown" || type == "none" || type == undefined) {
          this.online = false;
          alertService.presentToast('No network access, please check network connection');
        }
        else
          this.online = true;
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

    this.formInit();
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    if (this.online)
      Promise.all([this.LoadStates(), this.LoadOrganizations()]);
    else
      this.alertService.presentToast('No network access, please check network connection');
  }

  dismissRegister() {
    this.modalController.dismiss();
  }

  LoadStates() {
    this.loadingServ.present();
    this.entityService.loadget('supportedStates').catch((err: HttpErrorResponse) => {
      this.loadingServ.dismiss(), this.alertService.presentToast(`An error occurred while processing your request`);
      return;
    }).then((res: any) => {
      this.loadingServ.dismiss();
      if (res.status == 'OK') {
        this.stateList = res.data;
        this.sortList(this.stateList);
      }
    });
  }

  LoadOrganizations() {
    this.entityService.nojwtfindAll('Organization').catch((err: HttpErrorResponse) => {
      this.alertService.presentToast(`An error occurred while processing your request`);
      return;
    }).then((res: any) => {
      if (res.status == 'OK') {
        this.organizationList = res.data;
        this.sortList(this.organizationList);
      }
    });
  }

  async termsModal() {
    // this.dismissLogin();
    const termsModal = await this.modalController.create({
      component: NotePage,
    });
    return await termsModal.present();
  }

  get f() { return this.regForm.controls; }

  async save() {
    if (this.online) {
      this.regForm.patchValue({
        mobile: +this.regForm.get('mobile').value, stateID: +this.regForm.get('stateID').value,
        districtID: +this.regForm.get('districtID').value, mandalID: +this.regForm.get('mandalID').value
      });
      this.presentLoading();
      // await this.checkUserAvailability().then((resp) => {
      //   if (resp) {
      //     this.alertService.presentToast(`Login Name already Exists, Please choose another`);
      //     this.loading.dismiss();
      //     return;
      //   }

      if (!this.validMobile) {
        this.alertService.presentToast(`Mobile Number already Exists, Please choose another`);
        this.loading.dismiss();
        return;
      }

      let entityDat = this.regForm.value;
      delete entityDat.confirmpswd;
      delete entityDat.age;
      let tent = this.regForm.get('stateID').value == 2 ? 'AP' : 'Telangana';
      this.storage.setItem('tenant', tent); localStorage.setItem('tenant', tent);
      this.entityService.SaveRegistration(tent, entityDat).subscribe(
        data => {
          let result: any;
          result = data;
          this.alertService.presentToast('Member Registered Successfully')
          this.roleEntity = { memberID: result.data.id, roleName: 'Member' };

          let entity = `{ "loginName":"${this.regForm.value.mobile}" , "password": "${this.regForm.value.password}" }`;
          this.entityService.Login(this.regForm.get('stateID').value == 2 ? 'AP' : 'Telangana', entity).subscribe(
            data => {
              this.platform.ready().then(() => {
                // 'hybrid' detects both Cordova and Capacitor
                if (this.platform.is('hybrid')) {
                  // make your native API calls
                  this.entityService.getToken().then(() => {
                    if (this.entityService.isLoggedIn) {
                      this.navCtrl.navigateRoot('/request');
                      this.addRole();
                    }
                  });
                } else {
                  // fallback to browser APIs
                  console.log('browser');
                  localStorage.setItem('tenant', this.regForm.get('stateID').value == 2 ? 'AP' : 'Telangana');
                  localStorage.setItem('user', JSON.stringify(data));
                  let user = JSON.parse(localStorage.getItem('user'));
                  let userInfo;
                  this.storage.getItem('token').then(data => { console.log(data), userInfo = data.data.jwt; }, error => console.error(error));
                  this.entityService.jwt = localStorage.getItem('user') ? user.data.jwt : userInfo;
                  this.entityService.tenant = localStorage.getItem('tenant');
                  // localStorage.setItem('jwt', localStorage.getItem('user') ? user.data.jwt : userInfo);
                  // this.storage.setItem('jwt', userInfo);
                  this.addRole();
                }
              });
              this.loading.dismiss();
            },
            error => {
              console.log(error);
            },
            () => {
              this.dismissRegister();
              this.loading.dismiss();
            }
          );
          // this.alertService.presentToast(data['message']);
        },
        error => {
          console.log(error);
        },
        () => {

        });
      //});
    }
    else
      this.alertService.presentToast('No network access, please check network connection');
  }

  addRole() {
    this.entityService.post('addRoleToUser', this.roleEntity).catch((err: HttpErrorResponse) => {
      // console.error('An error occurred:', err.error);
      this.alertService.presentToast(`An error occurred while processing your request`);
      return;
    }).then((res: any) => {
      if (res) {
        // this.loading = false;
      }
    });
  }

  // async checkUserAvailability(): Promise<boolean> {
  //   let result1: boolean = false;
  //   this.storage.setItem('tenant', this.regForm.get('stateID').value == 2 ? 'AP' : 'Telangana');
  //   await this.entityService.checkUserAvailability(this.regForm.get('stateID').value == 2 ? 'AP' : 'Telangana', this.regForm.get('loginName').value).catch((err: HttpErrorResponse) => {
  //     let resp = err.error;
  //     this.alertService.presentToast(resp.message);
  //     result1 = true;
  //   }).then((res: any) => {
  //     if (res) {
  //       let result = res;
  //       if (result.status == 'OK' && result.message == 'login name is already exists')
  //         result1 = true;
  //     }
  //   });
  //   return result1;
  // }

  async checkMobileAvailability(): Promise<boolean> {
    if (!this.regForm.controls['mobile'].valid)
      return;

    this.validMobile = true;
    await this.entityService.checkMobileAvailability(this.regForm.get('mobile').value, this.regForm.get('id').value).catch((err: HttpErrorResponse) => {
      let resp = err.error;
      this.validMobile = false;
      // this.regForm.patchValue({ mobile: '' });
      this.alertService.presentToast(resp.message);
      return;
    }).then((res: any) => {
      if (res) {
        // let result = res;
        // if (result.status == 'OK')
        this.validMobile = true;
      }
    });
  }

  changedDropDown(typeOfDropDown: number, id: number) {
    const hierarchyList = [1, 2, 10];
    if (+id)
      this.getHierarchy(typeOfDropDown, id, hierarchyList[typeOfDropDown]);
    else
      this.clearData(typeOfDropDown);
  }

  async getHierarchy(parentTypeId: number, parentId: number, childTypeId: number) {
    if (this.online) {
      this.loadingServ.present();
      let tenant = this.regForm.get('stateID').value == 2 ? 'AP' : 'Telangana';
      this.storage.setItem('tenant', tenant)
      await this.entityService.getData(`ChildData/${childTypeId}/${parentTypeId}/${parentId}?tenant=${tenant}`).
        then((res: any) => {
          if (res) {
            let result = res;
            this.loadingServ.dismiss();
            if (result.data) {
              let types = {
                '1': () => { this.clearData(parentTypeId), this.districtList = result.data, this.sortList(this.districtList) },
                '2': () => { this.clearData(parentTypeId), this.mandalList = result.data, this.sortList(this.mandalList) },
              };
              types[parentTypeId]();
            }
          }
          else
            this.loadingServ.dismiss(), this.alertService.presentToast(`An error occurred while processing your request`); //this.loading = false, 
        });
    }
    else
      this.alertService.presentToast('No network access, please check network connection');
  }

  clearData(id: number) {
    let types = {
      '1': () => {
        this.regForm.patchValue({ districtID: '', mandalID: '' });
        this.districtList = [];
        this.mandalList = [];
      },
      '2': () => {
        this.regForm.patchValue({ mandalID: '' });
        this.mandalList = [];
      },
    };
    types[id]();
  }

  formInit() {
    this.regForm = this.fb.group({
      id: [0],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      lastBloodDonationDate: [null],
      mobile: ['', [Validators.required, Validators.pattern(this.mobilePattern)]],
      genderID: ['', Validators.required],
      address: ['', Validators.required],
      stateID: ['', Validators.required],
      districtID: ['', Validators.required],
      mandalID: ['', Validators.required],
      city: ['', Validators.required],
      bloodGroup: ['', Validators.required],
      canDonateBlood: [true, Validators.required],
      canDonatePlatelets: [true, Validators.required],
      email: ['', [Validators.email]],
      loginName: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmpswd: ['', [Validators.required, Validators.minLength(8)]],
      diabetic: [false, Validators.required],
      hyperTension: [false, Validators.required],
      organizationID: [''],
      receiveSms: [true],
      receiveMobileNotification: [true],
      pragnant: [false],
      breastFeeding: [false],
      age:['']
    }, {
      validator: MustMatch('password', 'confirmpswd')
    });
  }

  async couchEntities() {

    let name = this.entityName;
    this.loadingServ.present();
    await this.entityService.couchEntities(name).then((res: any) => {
      if (res) {
        let result = res;
        // Hide the loading spinner on success or error
        this.loadingServ.dismiss();
        if (result.data) {
          this.master[name.replace(/ /g, '_')] = result.data.map(row => this.pick(row, ['id', 'name', 'scheduleCasteType', 'castettype', 'shortName']));
          this.sortList(this.master[name.replace(/ /g, '_')]);
        }
      }
      else
        this.loadingServ.dismiss(), this.alertService.presentToast(`An error occurred while processing your request`);
    });
  }

  pick(obj, keys) {
    return keys.map(k => k in obj ? { [k]: obj[k] } : {})
      .reduce((res, o) => Object.assign(res, o), {});
  }

  sortList(list: any) {
    list.sort((a, b) => (a.name === b.name) ? 0 : (a.name > b.name) ? 1 : -1);
  }

  async presentLoading() {
    // Prepare a loading controller
    this.loading = await this.loadingController.create({
      message: 'Loading...'
    });
    // Present the loading controller
    await this.loading.present();
  }

  ionViewDidEnter() {
    this.subscription = this.platform.backButton.subscribe(async () => {

      const element = await this.modalController.getTop();
      const loadelement = await this.loadingController.getTop();
      if (loadelement) {
        loadelement.dismiss();
        return;
      }
      else if (element) {
        element.dismiss();
        return;
      }
      else
        this.dismissRegister();
    });
  }

  ionViewWillLeave() {
    this.subscription.unsubscribe();
  }

  goBack() {
    this.dismissRegister();
  }

  doRefresh(event) {
    this.formInit();
    Promise.all([this.LoadStates(), this.LoadOrganizations()]);
    setTimeout(() => { event.target.complete(); }, 2000);
  }

  vlidateSpace(event) {
    event.target.value = event.target.value.replace(/\s/g, "");
  }

  calculateDOB(age:string){
    this.regForm.patchValue({dateOfBirth: this.datePipe.transform(new Date(new Date().setFullYear(new Date().getFullYear() - +age)), 'yyyy-MM-dd')});
    
  }

  calculateAge(dob:string){
    if(dob){
      const convertDOB = new Date(dob);
      const timeDiff = Math.abs(Date.now() - convertDOB.getTime());
      this.regForm.patchValue({age: Math.floor((timeDiff / (1000 * 3600 * 24))/365)});
    }
  }

}
export interface IList {
  id: number;
  name: string;
}
