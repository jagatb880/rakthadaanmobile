import { Component, OnInit } from '@angular/core';
import { EntityService } from '../services/entity.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController, LoadingController, NavController, MenuController, Platform } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { NgForm } from '@angular/forms';
import { AlertService } from 'src/app/services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Base } from '../Base';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { LoadingService } from '../services/loader.service';
import { Network } from '@ionic-native/network/ngx';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage extends Base implements OnInit {

  regForm = new FormGroup({});
  subscription: any;
  districtList = []; mandalList = []; tent = ''
  item: IList[]; entityName: any; organizationList = [];
  master: any = {
    'GenderMaster': this.item,
    'StateMaster': this.item,
  };

  entity: any;
  records: any;
  validMobile: boolean = true;
  bloodgrps = [{ name: 'A-' }, { name: 'A+' }, { name: 'B-' }, { name: 'B+' }, { name: 'O+' }, { name: 'O-' }, { name: 'AB+' }, { name: 'AB-' }, { name: 'No Idea' }];
  showBloodGroup:boolean = true;
  mobilePattern = "^([+][9][1]|[9][1]|[0]){0,1}([6-9]{1})([0-9]{9})$";

  constructor(protected entityService: EntityService,
    private fb: FormBuilder,
    protected router: Router,
    private modalCtrl: ModalController,
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

    for (const item of Object.keys(this.master)) {
      this.entityName = item.replace(/_/g, ' ');
      this.couchEntities();
    }

    this.formInit();
    this.storage.getItem('token').then(data => { this.showBloodGroup = (data.data.roles == 'Member' || data.data.roles == 'Donar') ? false : true });
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    if (this.online)
      Promise.all([this.LoadStates(), this.LoadOrganizations(), this.LoadData()])
    else
      this.alertService.presentToast('No network access, please check network connection');
  }

  async LoadData() {
    this.loadingServ.present();
    let user: any = JSON.parse(localStorage.getItem('user'));
    await this.entityService.findById(`Member`, user.data.id).catch((err: HttpErrorResponse) => {
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
          this.records = result.data;
          Promise.all([this.changedDropDown(1, result.data.stateID), this.changedDropDown(2, result.data.districtID)]).then(async () => {
            this.regForm.patchValue(this.records);
            this.loadingServ.dismiss();
            setTimeout(() => { this.regForm.patchValue({ stateID: this.records.stateID }), 1000 });
          });
        }
        else
          this.loadingServ.dismiss(), this.alertService.presentToast(`An error occurred while processing your request`); //this.loading = false, 
      });
  }

  get f() { return this.regForm.controls; }

  async save() {
    if (this.online) {
      this.regForm.patchValue({
        mobile: +this.regForm.get('mobile').value, stateID: +this.regForm.get('stateID').value,
        districtID: +this.regForm.get('districtID').value, mandalID: +this.regForm.get('mandalID').value
      });


      if (!this.validMobile) {
        this.alertService.presentToast(`Mobile Number already Exists, Please choose another`);
        // this.loading.dismiss();
        return;
      }

      this.entityService.onSave('Member', this.regForm.getRawValue()).subscribe((res: any) => {
        if (res.status == 'OK') {
          this.alertService.presentToast('Profile Updated')
          this.LoadData();
          this.navCtrl.navigateRoot('/request');
          // this.regForm.reset();
          // this.formInit();
          // this.regForm.patchValue({genderID:'0',stateID:'0',districtID:'0',bloodGroup:'0'});
          // this.loading = false, this.toastr.success('Successfully Registered');
        }
        // else
        // this.loading = false, this.toastr.error( `${res.message}`);
      });
    }
    else
      this.alertService.presentToast('No network access, please check network connection');
  }

  // async checkUserAvailability(): Promise<boolean> {
  //   if (this.online) {
  //     let result1: boolean = false;
  //     await this.entityService.checkUserAvailability(this.regForm.get('stateID').value == 2 ? 'AP' : 'Telangana', this.regForm.get('loginName').value).catch((err: HttpErrorResponse) => {
  //       let resp = err.error;
  //       this.alertService.presentToast(resp.message);
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
      await this.entityService.getData(`ChildData/${childTypeId}/${parentTypeId}/${parentId}?tenant=${this.entityService.tenant}`).
        then((res: any) => {
          if (res) {
            let result = res;
            if (result.data) {
              let types = {
                '1': () => { this.clearData(parentTypeId), this.districtList = result.data, this.regForm.patchValue({ districtID: this.records.districtID }), this.sortList(this.districtList) },
                '2': () => { this.clearData(parentTypeId), this.mandalList = result.data, this.regForm.patchValue({ mandalID: this.records.mandalID }), this.sortList(this.mandalList) },
              };
              types[parentTypeId]();
            }
          }
          else
            this.alertService.presentToast(`An error occurred while processing your request`);
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
      canDonateBlood: ['', Validators.required],
      canDonatePlatelets: ['', Validators.required],
      email: ['', [Validators.email]],
      loginName: [''],
      password: ['', Validators.required],
      organizationID: [''],
      receiveSms: [true],
      receiveMobileNotification: [true],
      diabetic: [''],
      hyperTension: [''],
      pragnant: [false],
      breastFeeding: [false],
      active: true
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

  ionViewDidEnter() {
    this.subscription = this.platform.backButton.subscribe(async () => {

      const element = await this.modalCtrl.getTop();
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
      this.alertService.presentToast(`An error occurred while processing your request`);
      return;
    }).then((res: any) => {
      if (res.status == 'OK') {
        this.stateList = res.data;
        this.sortList(this.stateList);
        setTimeout(() => { this.regForm.controls['stateID'].disable() }, 2000);
      }
    });
  }

  LoadOrganizations() {
    this.entityService.nojwtfindAll('Organization').catch((err: HttpErrorResponse) => {
      this.loadingServ.dismiss(), this.alertService.presentToast(`An error occurred while processing your request`);
      return;
    }).then((res: any) => {
      if (res.status == 'OK') {
        this.organizationList = res.data;
        this.sortList(this.organizationList);
      }
    });
  }

  doRefresh(event) {
    Promise.all([this.LoadStates(), this.LoadOrganizations(), this.LoadData()]).then(() => {
      setTimeout(() => { event.target.complete(); }, 2000);
    });
  }

}
export interface IList {
  id: number;
  name: string;
}
