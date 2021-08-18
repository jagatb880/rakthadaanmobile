import { Component, OnInit, Input } from '@angular/core';
import { EntityService } from '../services/entity.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuController, LoadingController, Platform, ModalController, AlertController, NavParams, NavController } from '@ionic/angular';
import { AlertService } from 'src/app/services/alert.service';
import { Base } from '../Base';
import * as moment from 'moment';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { LoadingService } from '../services/loader.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Market } from '@ionic-native/market/ngx';
import { Network } from '@ionic-native/network/ngx';

@Component({
  selector: 'app-edit-request',
  templateUrl: './edit-request.page.html',
  styleUrls: ['./edit-request.page.scss'],
})
export class EditRequestPage extends Base implements OnInit {

  reqForm = new FormGroup({});
  facilityList = []; minDate = ''; subscription: any; tent = ''; datime = '';
  lastTimeBackPress = 0; timePeriodToExit = 2000; req: any; editId = ''; districtID = '';
  files: any; fileName = '';
  unitPattern = "^0*([1-9]|10)$";
  public min = new Date();

  // @Input() editReqData: any;

  constructor(
    protected entityService: EntityService,
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

    this.menu.enable(true);
    this.entityName = "RequestDonation";
    this.reqformInit();
    this.minDate = this.datePipe.transform(this.min, 'yyyy-MM-dd');

    this.req = navParams.get('editReqData');
  }

  ngOnInit() {
  }

  get f() { return this.reqForm.controls; }

  async ionViewWillEnter() {
    if (this.online) {
      this.onEdit(this.req);
    }
    else
      this.alertService.presentToast('No network access, please check network connection');
  }

  async LoadFacility(id: any) {
    if (id != '') {
      this.facilityList = [], this.reqForm.patchValue({ facilityID: '' });
      await this.entityService.get('facilitiesInADistrict', id).catch((err: HttpErrorResponse) => {
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
        let result = res;
        if (result.status == 'OK') {
          let data = result.data;
          this.facilityList = data.filter(f => f.active == true && (this.reqForm.value.requestType == 2) ? f.acceptsPlatelets : f.acceptsBlood);
          super.sortList(this.facilityList);
        }
      });
    }
    else
      this.facilityList = [], this.reqForm.patchValue({ facilityID: '' });
  }

  async save() {
    if (this.online) {
      let error;
      let user: any = this.entityService.token;
      this.reqForm.patchValue({
        id: this.editId, requesterID: this.entityService.userId, dateTime: moment(this.reqForm.value.dateTime).format('YYYY-MM-DDTHH:mm:ss'),
        requestingBlood: this.reqForm.value.requestingBlood ? user.data.bloodGroup : 'Any Blood'
      });
      let entity = this.reqForm.value;
      entity.prescriptionName = this.fileName;
      delete entity.districtID;
      let formData = new FormData();
      if (this.files)
        formData.append('file', this.files);
      formData.append(`request`, JSON.stringify(entity));
      this.loadingServ.present();
      // await this.entityService.post('updateRequest', entity).catch((err: HttpErrorResponse) => {
      await this.entityService.saveFormNew('jwt/domain/updateRequestMul', formData).catch((err: HttpErrorResponse) => {
        error = err.error; this.loadingServ.dismiss();
        if (err.status == 401) {
          localStorage.clear();
          this.storage.remove("token");
          this.alertService.presentToastmiddle(`Session Expired`);
          this.navCtrl.navigateRoot('/');
          return;
        }
        else
          this.ionViewWillEnter(), this.alertService.presentToast(`${error.message}`);
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
            this.loadingServ.dismiss(), this.ionViewWillEnter(), this.alertService.presentToast(`${error.message}`);
        });
    }
    else
      this.alertService.presentToast('No network access, please check network connection');
  }

  onEdit(item: any) {
    this.files = ''; this.fileName = '';
    this.datime = item.request.requestDateTime;
    this.editId = item.request.id;
    this.fileName = item.request.prescriptionName;
    this.reqForm.patchValue({
      requestType: item.request.requestType, units: item.request.units,
      dateTime: item.request.requestDateTime, purpose: item.request.purpose, status: item.request.status,
      requestingBlood: item.request.requestingBlood === 'Any Blood' ? false : true
    });
    Promise.all([this.LoadStates(), this.LoadFacility(item.request.facility.districtID)]).then(() => {
      setTimeout(() => { this.reqForm.patchValue({ districtID: this.req.request.facility.districtID, facilityID: this.req.request.facility.id }, { onlySelf: true, emitEvent: false }) }, 500);
    });
  }

  LoadStates() {
    // this.loadingServ.present();
    this.entityService.loadget('supportedStates').catch((err: HttpErrorResponse) => {
      this.loadingServ.dismiss(), this.alertService.presentToast(`An error occurred while processing your request`);
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

  reqformInit() {
    this.reqForm = this.fb.group({
      id: [''],
      requesterID: [''],
      dateTime: ['', [Validators.required]],
      districtID: ['', [Validators.required]],
      facilityID: ['', [Validators.required]],
      requestType: ['', [Validators.required]],
      requestingBlood: [true],
      units: ['', [Validators.required, Validators.pattern(this.unitPattern)]],
      purpose: [''],
      status: ['']
    });
  }

  onReqTypeChange() {
    this.reqForm.patchValue({ districtID: '', facilityID: '' }), this.facilityList = [];
  }

  async changedDropDown(typeOfDropDown: number, id: number) {
    const hierarchyList = [1, 2, 10];
    if (+id)
      this.getHierarchy(typeOfDropDown, id, hierarchyList[typeOfDropDown]);
    else
      this.clearData(typeOfDropDown);
  }

  async getHierarchy(parentTypeId: number, parentId: number, childTypeId: number) {
    if (this.online) {
      this.loadingServ.present();
      await this.entityService.getData(`ChildData/${childTypeId}/${parentTypeId}/${parentId}?tenant=${this.entityService.tenant}`).
        then((res: any) => {
          if (res) {
            this.loadingServ.dismiss();
            let result = res;
            if (result.data) {
              this.districtList = result.data,
                super.sortList(this.districtList);
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

  goBack() {
    this.modalController.dismiss();
  }

  callImage() {
    let element: HTMLElement = document.querySelector('input[type="file"]') as HTMLElement;
    element.click();
  }

  changeListener(event) {
    this.files = event.target.files.item(0);
    if (this.files)
      this.fileName = this.files.name;
  }

}

