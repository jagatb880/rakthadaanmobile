import { Component, OnInit } from '@angular/core';
import { EntityService } from '../services/entity.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController, LoadingController, NavController, Platform, PopoverController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { NgForm } from '@angular/forms';
import { AlertService } from 'src/app/services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { LoadingService } from '../services/loader.service';
import { Network } from '@ionic-native/network/ngx';
import { DatePipe } from '@angular/common';
import { PlasmaTermsPage } from '../plasma-terms/plasma-terms.page';

@Component({
  selector: 'app-plasma-registration',
  templateUrl: './plasma-registration.page.html',
  styleUrls: ['./plasma-registration.page.scss'],
})
export class PlasmaRegistrationPage implements OnInit {

  plasmaRegForm = new FormGroup({});

  districtList: any[] = []; mandalList: any[] = []; subscription: any; stateList = []; organizationList: any[] = [];
  item: IList[]; entityName: any; roleEntity = {}; loading: any; online: boolean = false;
  master: any = {
    'GenderMaster': this.item,
    // 'StateMaster': this.item,
  };

  bloodgrps = [{ name: 'A-' }, { name: 'A+' }, { name: 'B-' }, { name: 'B+' }, { name: 'O+' }, { name: 'O-' }, { name: 'AB+' }, { name: 'AB-' },{name: 'No Idea'}];
  mobilePattern = "^([+][9][1]|[9][1]|[0]){0,1}([6-9]{1})([0-9]{9})$";
  files: any; minToDate: any; maxRecoveryDate: any; maxPositiveDate: any; fileName = '';
  lstSymptom = [{ id: 1, name: 'breathing problem' }, { id: 2, name: 'cough' }, { id: 3, name: 'cold' }, { id: 4, name: 'fever' }, { id: 5, name: 'body ache' }, { id: 6, name: 'No Symtoms' }];

  constructor(
    protected entityService: EntityService,
    private fb: FormBuilder,
    protected router: Router,

    private modalController: ModalController,
    private authService: AuthService,
    private navCtrl: NavController,
    private popover: PopoverController,
    public alertService: AlertService,
    public loadingController: LoadingController,
    private platform: Platform,
    private storage: NativeStorage,
    public loadingServ: LoadingService,
    private datePipe: DatePipe,
    public network: Network) {

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

    this.formInit();
    this.maxRecoveryDate = new Date().toJSON().split('T')[0];
    this.maxPositiveDate = new Date().toJSON().split('T')[0];
  }

  ngOnInit() {
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

  ionViewWillEnter() {
    if (this.online)
      Promise.all([this.LoadStates()]);
    else
      this.alertService.presentToast('No network access, please check network connection');
  }

  dismissRegister() {
    this.modalController.dismiss();
  }

  get f() { return this.plasmaRegForm.controls; }

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

  async save() {
    if (this.online) {
      this.plasmaRegForm.patchValue({
        mobile: +this.plasmaRegForm.get('mobile').value,
      });
      this.loadingServ.present();
      let entityData = this.plasmaRegForm.getRawValue();
      let tent = this.plasmaRegForm.get('stateID').value == 2 ? 'AP' : 'Telangana';
      this.storage.setItem('tenant', tent); localStorage.setItem('tenant', tent);
      let formData = new FormData();
      entityData.covidSymptoms = entityData.covidSymptoms.toString();
      delete entityData.stateID;
      formData.append(`request`, JSON.stringify(entityData));
      if (this.files)
        formData.append('dischargeReport', this.files);
      this.entityService.SaveForm(tent, formData).subscribe(
        data => {
          this.alertService.presentToast('Member Registered Successfully');
          formData = new FormData();
          this.fileName = '';
          this.formInit();
          this.modalController.dismiss();
          this.loadingServ.dismiss();
          console.log(data);
          // this.alertService.presentToast(data['message']);
        },
        error => {
          console.log(error);
          this.loadingServ.dismiss();
        },
        () => {

        });
      // });
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

  async checkUserAvailability(): Promise<boolean> {
    let result1: boolean = false;
    this.storage.setItem('tenant', this.plasmaRegForm.get('stateID').value == 2 ? 'AP' : 'Telangana');
    await this.entityService.checkUserAvailability(this.plasmaRegForm.get('stateID').value == 2 ? 'AP' : 'Telangana', this.plasmaRegForm.get('loginName').value).catch((err: HttpErrorResponse) => {
      let resp = err.error;
      this.alertService.presentToast(resp.message);
      result1 = true;
    }).then((res: any) => {
      if (res) {
        let result = res;
        if (result.status == 'OK' && result.message == 'login name is already exists')
          result1 = true;
      }
    });
    return result1;
  }

  formInit() {
    this.plasmaRegForm = this.fb.group({
      id: [0],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      age: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern(this.mobilePattern)]],
      genderID: ['', Validators.required],
      // maritalStatus: [false, Validators.required],
      weight: ['', Validators.required],
      covidTested: [false, Validators.required],
      symptoms: [false, Validators.required],
      covidSymptoms: [''],
      email: ['', [Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$")]],
      stateID: ['', Validators.required],
      city: ['', Validators.required],
      bloodGroup: ['', Validators.required],
      diabetes: [false, Validators.required],
      fourteenDrinksPerWeek: [false, Validators.required],
      liverDisease: [false, Validators.required],
      kidneyDisease: [false, Validators.required],
      lungDisease: [false, Validators.required],
      bloodPressure: [false, Validators.required],
      aadharCard: [true, Validators.required],
      dateOfCovidPositve: ['', Validators.required],
      dateOfRecovery: ['', Validators.required],
      dischargeReport: [''],
      // loginName: ['', [Validators.required, Validators.minLength(4)]],
      //password: ['', [Validators.required, Validators.minLength(8)]],
      //confirmpswd: ['', [Validators.required, Validators.minLength(8)]],
      active: [true],
      // receiveSms: [true],
      covidTestedNegativeInLastTwoweeks: [false],
      married: [false],
      children: [false]
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
    Promise.all([this.LoadStates()]);
    setTimeout(() => { event.target.complete(); }, 2000);
  }

  oncovidPositiveDateChange(val: any) {
    if (val != null) {
      let positiveDate = this.datePipe.transform(val, 'yyyy-MM-dd');
      let dateOfRecovery = this.datePipe.transform(this.plasmaRegForm.get('dateOfRecovery').value, 'yyyy-MM-dd');
      this.minToDate = positiveDate;
      if (new Date(positiveDate) > new Date(dateOfRecovery))
        this.plasmaRegForm.patchValue({ dateOfRecovery: '' });
      // let edate = this.datePipe.transform(val, 'yyyy-MM-dd').split('-'), cnvDate = new Date(parseInt(edate[0]), parseInt(edate[1]) - 1, parseInt(edate[2]), 0, 0, 0, 0);
      // this.minToDate = new Date(cnvDate);
    }
  }

  async presentTermsPopover() {
    const popover = await this.popover.create({
      component: PlasmaTermsPage,
      cssClass: 'pop-over-style',
      translucent: true
    });

    popover.onDidDismiss()
      .then((data) => {
        if (data.role != 'backdrop') {
          if (data.data == 'save')
            this.save();
        }
        // this.eventsList.push(data.data);
      });

    return await popover.present();
  }

}
export interface IList {
  id: number;
  name: string;
}
