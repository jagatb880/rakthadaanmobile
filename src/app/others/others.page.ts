import { Component, OnInit } from '@angular/core';
import { EntityService } from '../services/entity.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController, NavController, MenuController, LoadingController, Platform } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { NgForm } from '@angular/forms';
import { AlertService } from 'src/app/services/alert.service';
import { Base } from '../Base';
import * as moment from 'moment';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MustMatch } from '../validators/mustmatch';
import { LoadingService } from '../services/loader.service';
import { Network } from '@ionic-native/network/ngx';

@Component({
  selector: 'app-others',
  templateUrl: './others.page.html',
  styleUrls: ['./others.page.scss'],
})
export class OthersPage extends Base implements OnInit {

  reqForm = new FormGroup({});
  regForm = new FormGroup({});
  facilityList = []; minDate = ''; shw = ''; otherid = ''; subscription: any; tent = ''; organizationList = []; validMobile: boolean = false;

  unitPattern = "^0*([1-9]|10)$";
  mobilePattern = "^([+][9][1]|[9][1]|[0]){0,1}([6-9]{1})([0-9]{9})$";
  public min = new Date();

  constructor(
    protected entityService: EntityService,
    private fb: FormBuilder,
    protected router: Router,
    private datePipe: DatePipe,
    private modalController: ModalController,
    private authService: AuthService,
    private navCtrl: NavController,
    public alertService: AlertService,
    protected storage: NativeStorage,
    protected menu: MenuController,
    public loadingController: LoadingController,
    public platform: Platform,
    public loadingServ: LoadingService,
    public network: Network) {
    super(entityService, router, storage, menu, loadingController, network, platform, alertService);

    this.menu.enable(true);
    this.regformInit();
    this.reqformInit();

    this.minDate = this.datePipe.transform(this.min, 'yyyy-MM-dd');
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    if (this.online)
      Promise.all([this.LoadStates(), this.LoadOrganizations()]);
    else
      this.alertService.presentToast('No network access, please check network connection');
  }

  LoadFacility(id: any) {
    if (this.online) {
      if (id > 0) {
        this.facilityList = [], this.reqForm.patchValue({ facilityID: '' });
        this.loadingServ.present();
        this.entityService.get('facilitiesInADistrict', id).catch((err: HttpErrorResponse) => {
          this.loadingServ.dismiss();
          if (err.status == 401) {
            localStorage.clear();
            this.storage.remove("token");
            this.alertService.presentToastmiddle(`Session Expired`);
            this.navCtrl.navigateRoot('/');
            return;
          }
          else
            this.alertService.presentToast(`An error occurred while processing your request`);
          return;
        }).then((res: any) => {
          if (res) {
            setTimeout(() => { this.loadingServ.dismiss() }, 1500);
            let result = res;
            if (result.status == 'OK') {
              let data = result.data;
              this.facilityList = data.filter(f => f.active == true);
              super.sortList(this.facilityList);
            }
          }
        });
      }
      else
        this.facilityList = [], this.reqForm.patchValue({ facilityID: '' });
    }
    else
      this.alertService.presentToast('No network access, please check network connection');
  }

  async save() {
    if (this.online) {

      let error;
      this.reqForm.patchValue({ requesterID: this.otherid, status: 1, dateTime: moment(this.reqForm.value.dateTime).format('YYYY-MM-DDTHH:mm:ss') });

      let entity = this.reqForm.value;
      delete entity.districtID;
      this.loadingServ.present();
      await this.entityService.post('requestDonation/', entity).catch((err: HttpErrorResponse) => {
        // console.error('An error occurred:', err);
        let resp = err.error;
        this.loadingServ.dismiss();
        if (err.status == 401) {
          localStorage.clear();
          this.storage.remove("token");
          this.alertService.presentToastmiddle(`Session Expired`);
          this.navCtrl.navigateRoot('/');
          return;
        }
        else
        this.alertService.presentToast(`${resp.message}`);
          return;
      }).
        then((res: any) => {
          if (res) {
            let result = res;
            // this.regForm.reset(),
            this.regformInit();
            this.shw = '';
            this.alertService.presentToast(`${result.message}`);
            this.loadingServ.dismiss();
            // this.router.navigate(['/accepted']);
            // this.reqForm.reset();
            // this.reqformInit();
          }
          else
            this.loadingServ.dismiss(), this.alertService.presentToast(`${error.message}`);
        });
    }
    else
      this.alertService.presentToast('No network access, please check network connection');
  }

  doRefresh(event) {
    this.ionViewWillEnter();
    setTimeout(() => { event.target.complete(); }, 2000);
  }

  reqformInit() {
    this.reqForm = this.fb.group({
      requesterID: [''],
      dateTime: ['', [Validators.required]],
      districtID: ['', [Validators.required]],
      facilityID: ['', [Validators.required]],
      requestType: ['', [Validators.required]],
      units: ['', [Validators.required, Validators.pattern(this.unitPattern)]],
      purpose: [''],
      status: ['']
    });
  }

  get f() { return this.regForm.controls; }
  get r() { return this.reqForm.controls; }

  async savereg() {
    if (this.online) {
      this.regForm.patchValue({
        mobile: +this.regForm.get('mobile').value, 
        // stateID: +this.regForm.get('stateID').value,
        // districtID: +this.regForm.get('districtID').value, mandalID: +this.regForm.get('mandalID').value
      });
      // await this.checkUserAvailability().then((resp) => {
      //   if (resp) {
      //     this.alertService.presentToast(`Login Name already Exists, Please choose another`);
      //     return;
      //   }

        if (!this.validMobile) {
          this.alertService.presentToast(`Mobile Number already Exists, Please choose another`);
          this.loading.dismiss();
          return;
        }

        let entity = this.regForm.getRawValue();
        delete entity.confirmpswd;
        this.loadingServ.present();
        this.entityService.onSave('Member', entity).subscribe(
          // if(res.status =='OK') {
          //   this.regForm.reset();
          //   this.formInit();
          // this.regForm.patchValue({genderID:'0',stateID:'0',districtID:'0',bloodGroup:'0'});
          // this.loading = false; this.toastr.success('Successfully Registered')
          // }
          // else
          // this.loading = false; this.toastr.error( `${res.message}`)
          data => {
            let result: any;
            result = data;
            this.storage.setItem('id', data);
            localStorage.setItem('other', JSON.stringify(data));
            let othr = JSON.parse(localStorage.getItem('other'));
            let othrid = this.storage.getItem('id');
            this.otherid = result.data.id;
            this.shw = 'others';
            this.loadingServ.dismiss();
            // this.alertService.presentToast(data['message']);
          },
          error => {
              this.loadingServ.dismiss();
              if (error.status == 401) {
                localStorage.clear();
                this.storage.remove("token");
                this.alertService.presentToastmiddle(`Session Expired`);
                this.navCtrl.navigateRoot('/');
                return;
              }
              else
                this.alertService.presentToast(`An error occurred while processing your request`);
              return;
          },
          () => {
            this.loadingServ.dismiss();
          });
      //});
    }
    else
      this.alertService.presentToast('No network access, please check network connection');
  }

  // async checkUserAvailability(): Promise<boolean> {
  //   if (this.online) {
  //     let result1: boolean = false;
  //     await this.entityService.checkUserAvailability(this.regForm.get('stateID').value == 2 ? 'AP' : 'Telangana', this.regForm.get('loginName').value).catch((err: HttpErrorResponse) => {
  //       let resp = err.error; this.alertService.presentToast(resp.message);
  //       result1 = true;
  //     }).then((res: any) => {
  //       if (res) {
  //         let result = res;
  //         if (result.status == 'OK' && result.message == 'login name is already exists')
  //           result1 = true;
  //       }
  //     });
  //     return result1;
  //   }
  //   else
  //     this.alertService.presentToast('No network access, please check network connection');
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
      await this.entityService.getData(`ChildData/${childTypeId}/${parentTypeId}/${parentId}?tenant=${this.entityService.tenant}`).catch((err: HttpErrorResponse) => {
        this.loadingServ.dismiss();
        if (err.status == 401) {
          localStorage.clear();
          this.storage.remove("token");
          this.alertService.presentToastmiddle(`Session Expired`);
          this.navCtrl.navigateRoot('/');
          return;
        }
        else
          this.alertService.presentToast(`An error occurred while processing your request`);
        return;
      }).
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

  regformInit() {
    this.regForm = this.fb.group({
      id: [0],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      // lastBloodDonationDate: [null],
      mobile: ['', [Validators.required, Validators.pattern(this.mobilePattern)]],
      genderID: ['', Validators.required],
      address: ['', Validators.required],
      // stateID: ['', Validators.required],
      // districtID: ['', Validators.required],
      // mandalID: ['', Validators.required],
      // city: ['', Validators.required],
      // bloodGroup: ['', Validators.required],
      // canDonateBlood: [true, Validators.required],
      // canDonatePlatelets: [true, Validators.required],
      // email: ['', [Validators.email]],
      // loginName: [''],
      // password: ['', [Validators.required, Validators.minLength(8)]],
      // confirmpswd: ['', [Validators.required, Validators.minLength(8)]],
      // organizationID: [''],
      // receiveSms: [true],
      // receiveMobileNotification: [true],
      // diabetic: [false, Validators.required],
      // hyperTension: [false, Validators.required],
      // pragnant: [false],
      // breastFeeding: [false],
    });
  }

  async couchEntities() {
    if (this.online) {
      let name = this.entityName;
      await this.entityService.couchEntities(name).then((res: any) => {
        if (res) {
          let result = res;
          if (result.data) {
            this.master[name.replace(/ /g, '_')] = result.data.map(row => this.pick(row, ['id', 'name', 'scheduleCasteType', 'castettype', 'shortName']));
            this.sortList(this.master[name.replace(/ /g, '_')]);
          }
        }
        else
          this.alertService.presentToast(`An error occurred while processing your request`);
      });
    }
    else
      this.alertService.presentToast('No network access, please check network connection');
  }

  pick(obj, keys) {
    return keys.map(k => k in obj ? { [k]: obj[k] } : {})
      .reduce((res, o) => Object.assign(res, o), {});
  }

  sortList(list: any) {
    list.sort((a, b) => (a.name === b.name) ? 0 : (a.name > b.name) ? 1 : -1);
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

  ionViewDidEnter() {
    this.subscription = this.platform.backButton.subscribe(async () => {
      const element = await this.modalController.getTop();
      const menuelement = await this.menu.getOpen();
      const loadelement = await this.loadingController.getTop();
      if (loadelement) {
        loadelement.dismiss();
        return;
      }
      else if (menuelement) {
        this.menu.close();
        return;
      } else if (element) {
        element.dismiss();
        return;
      }
      else
        this.navCtrl.navigateRoot('/request');
    });
  }

  ionViewWillLeave() {
    this.subscription.unsubscribe();
  }

  LoadStates() {
    this.entityService.loadget('supportedStates').catch((err: HttpErrorResponse) => {
      if (err.status == 401) {
        localStorage.clear();
        this.storage.remove("token");
        this.alertService.presentToastmiddle(`Session Expired`);
        this.navCtrl.navigateRoot('/');
        return;
      }
      else
        this.alertService.presentToast(`An error occurred while processing your request`);
      return;
    }).then((res: any) => {
      this.loading = false;
      if (res.status == 'OK') {
        this.stateList = res.data;
        // this.changedDropDown(1, this.entityService.tenant == 'AP' ? 2 : this.stateList.filter(f=>f.name.toUpperCase() == 'TELANGANA')[0]?.id);
        // this.regForm.patchValue({ stateID: this.entityService.tenant == 'AP' ? 2 : this.stateList.filter(f => f.name.toUpperCase() == 'TELANGANA')[0].id });
        // setTimeout(() => { this.regForm.controls['stateID'].disable() }, 2000);
        // this.changedDropDown(1, this.regForm.get('stateID').value);
      }
    });
  }

  vlidateSpace(event){
    event.target.value = event.target.value.replace(/\s/g, "");
  }

}
