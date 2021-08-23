import { Component, OnInit } from '@angular/core';
import { EntityService } from '../../services/entity.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuController, LoadingController, Platform, ModalController, AlertController, NavController } from '@ionic/angular';
import { AlertService } from 'src/app/services/alert.service';
import { Base } from '../../Base';
import * as moment from 'moment';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { LoadingService } from '../../services/loader.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Market } from '@ionic-native/market/ngx';
import { Network } from '@ionic-native/network/ngx';
import { OverlayEventDetail } from '@ionic/core';
import { PlasmaRegistrationPage } from 'src/app/plasma-registration/plasma-registration.page';

@Component({
  selector: 'app-request',
  templateUrl: './request.page.html',
  styleUrls: ['./request.page.scss'],
})
export class RequestPage extends Base implements OnInit {

  reqForm = new FormGroup({});
  facilityList = []; minDate = ''; subscription: any; tent = '';
  purposeList: any[];
  unitPattern = "^0*([1-9]|10)$";
  public min = new Date();
  maxDate = ''; files: any; fileName = '';
  otherSecion: boolean = false;
  allBloodGroup: any[];
  bloodType: any[];
  bloodTypes: any[];
  constructor(
    protected entityService: EntityService,
    private fb: FormBuilder,
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
    private navCtrl: NavController,
    public network: Network) {
    super(entityService, router, storage, menu, loadingController, network, platform, alertService);

    this.menu.enable(true);
    this.entityName = "RequestDonation";
    this.formInit();
    this.minDate = this.datePipe.transform(this.min, 'yyyy-MM-dd');
    this.maxDate = '2050-12-31';
  }

  ngOnInit() {
    // this.checkVersion();
    // this.reqForm.patchValue({dateTime:"2019-12-17T07:09:28.000Z"});
    // this.LoadFacility();
    this.bloodType = [
      {
        "name":"Self",
        "id":true
      },
      {
        "name":"Any Blood",
        "id":false
      }
    ]
    this.bloodTypes = this.bloodType;
  }

  get f() { return this.reqForm.controls; }

  async ionViewWillEnter() {
    // this.changedDropDown(1, this.entityService.tenant == 'AP' ? 2 : 39);
    if (this.online)
      this.formInit(), this.LoadStates(), this.LoadAllBloodGroup();
    else
      this.alertService.presentToast('No network access, please check network connection');
  }

  LoadStates() {
    // this.loadingServ.present();
    this.entityService.loadget('supportedStates').catch((err: HttpErrorResponse) => {
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
      if (res.status == 'OK') {
        this.stateList = res.data;
        this.sortList(this.stateList);
        this.changedDropDown(1, this.entityService.tenant == 'AP' ? 2 : this.stateList.filter(f => f.name.toUpperCase() == 'TELANGANA')[0].id);
        // this.loadingServ.dismiss();
      }
    });
  }

  LoadFacility(id: any) {
    if (id != '') {
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
          let result = res;
          setTimeout(() => { this.loadingServ.dismiss() }, 1500);
          if (result.status == 'OK') {
            let data = result.data;
            this.facilityList = data.filter(f => f.active == true && (this.reqForm.value.requestType == 2) ? f.acceptsPlatelets : f.acceptsBlood);
            super.sortList(this.facilityList);
          }
        }
      });
    }
    else
      this.facilityList = [], this.reqForm.patchValue({ facilityID: '' });
  }

  LoadAllBloodGroup(){
    this.entityService.findAllBloodGroup("crud/BloodGroup/findAll",this.entityService.jwt).then((response: any)=>{
      if(response.status == 'OK'){
        this.allBloodGroup = response.data;
      }
    })
  }

  async save() {
    if (this.online) {
      let error;
      // let user: any = this.entityService.token; 
      let user: any = JSON.parse(localStorage.getItem('user'));
      this.reqForm.patchValue({
        requesterID: user.data.id, status: 1, dateTime: moment(this.reqForm.value.dateTime).format('YYYY-MM-DDTHH:mm:ss'),
      });

      let entity = this.reqForm.value;
      delete entity.districtID;
      delete entity.requestRaisedFor;
      if(!this.otherSecion){
        delete entity.firstname;
        delete entity.lastname;
        delete entity.mobileno;
        delete entity.address;
        delete entity.gender;
      }
      let formData = new FormData();
      formData.append(`input`, JSON.stringify(entity));
      if (this.files)
        formData.append('file', this.files);
      this.loadingServ.present();
      await this.entityService.saveFormNew('jwt/domain/requestDonationMul', formData).catch((err: HttpErrorResponse) => {
        error = err.error;
        this.loadingServ.dismiss();
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
            this.router.navigate(['/accepted']);
          }
          else
            this.loadingServ.dismiss(), this.alertService.presentToast(`${error.message}`);
        });
    }
    else
      this.alertService.presentToast('No network access, please check network connection');
  }

  doRefresh(event) {
    this.formInit();
    Promise.all([this.changedDropDown(1, this.entityService.tenant == 'AP' ? 2 : this.stateList.filter(f => f.name.toUpperCase() == 'TELANGANA')[0].id)]).then(() => {
      setTimeout(() => { event.target.complete(); }, 2000);
    });
  }

  onReqTypeChange() {
    this.reqForm.patchValue({ districtID: '', facilityID: '' }), this.facilityList = [];
  }

  formInit() {
    this.reqForm = this.fb.group({
      requesterID: [''],
      requestRaisedFor: [''],
      firstname:[''],
      lastname:[''],
      mobileno:[''],
      address:[''],
      gender:[''],
      dateTime: ['', [Validators.required]],
      districtID: ['', [Validators.required]],
      facilityID: ['', [Validators.required]],
      requestType: ['', [Validators.required]],
      requestingBlood: [true],
      units: ['', [Validators.required, Validators.pattern(this.unitPattern)]],
      purpose: [''],
      status: ['']
    });
    this.files = ''; this.fileName = '';
    this.reqForm.controls['requestRaisedFor'].setValue("self");
    this.entityService.getAllPurpose("getallpurposes").then((response: any)=>{
      if(response.status == 'OK'){
        this.purposeList = response.data;
      }
    })
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
      }).then((res: any) => {
        if (res) {
          this.loadingServ.dismiss();
          let result = res;
          if (result.data) {
            let types = {
              '1': () => { this.clearData(parentTypeId), this.districtList = result.data, super.sortList(this.districtList) },
              '2': () => { this.clearData(parentTypeId), this.mandalList = result.data, super.sortList(this.mandalList) },
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
        this.reqForm.patchValue({ districtID: '', facilityID: '' });
        this.districtList = [];
        this.facilityList = [];
      },
      '2': () => {
        this.reqForm.patchValue({ facilityID: '' });
        this.facilityList = [];
      },
    };
    types[id]();
  }

  async plasmaModal() {
    const plasmaModal = await this.modalController.create({
      component: PlasmaRegistrationPage,
      animated: true
    });
    return await plasmaModal.present();

    // const modal = await this.modalController.create({
    //   component: PlasmaRegistrationPage,
    //   componentProps: {  },
    //   animated: true
    // });
    // modal.onDidDismiss().then((detail: OverlayEventDetail) => {

    // });
    // return await modal.present();

    // this.navCtrl.navigateForward('plasma-registration');

  }

  callImage() {
    let element: HTMLElement = document.querySelector('input[type="file"]') as HTMLElement;
    element.click();
  }


  changeListener(event) {
    this.files = event.target.files.item(0);
    if (this.files)
      this.fileName = this.files.name;
    // this.formData.append('updateImage', event.target.files[0]);
  }

  requestRiasedFor(){
    if(this.reqForm.controls['requestRaisedFor'].value == 'other'){
      this.otherSecion = true;
      this.reqForm.get('firstname').setValidators([Validators.required])
      this.reqForm.get('firstname').updateValueAndValidity();
      this.reqForm.get('lastname').setValidators([Validators.required])
      this.reqForm.get('lastname').updateValueAndValidity();
      this.reqForm.get('mobileno').setValidators([Validators.required])
      this.reqForm.get('mobileno').updateValueAndValidity();
      this.reqForm.get('address').setValidators([Validators.required])
      this.reqForm.get('address').updateValueAndValidity();
      this.reqForm.get('gender').setValidators([Validators.required])
      this.reqForm.get('gender').updateValueAndValidity();
      this.bloodTypes = this.allBloodGroup;
      this.reqForm.controls['requestingBlood'].setValue("");
    }else{
      this.otherSecion = false;
      this.reqForm.get('firstname').clearValidators();
      this.reqForm.get('firstname').updateValueAndValidity();
      this.reqForm.get('lastname').clearValidators();
      this.reqForm.get('lastname').updateValueAndValidity();
      this.reqForm.get('mobileno').clearValidators();
      this.reqForm.get('mobileno').updateValueAndValidity();
      this.reqForm.get('address').clearValidators();
      this.reqForm.get('address').updateValueAndValidity();
      this.reqForm.get('gender').clearValidators();
      this.reqForm.get('gender').updateValueAndValidity();
      this.bloodTypes = this.bloodType;
      this.reqForm.controls['requestingBlood'].setValue("");
    }
  }


}
