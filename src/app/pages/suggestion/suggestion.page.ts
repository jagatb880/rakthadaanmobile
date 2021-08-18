import { Component, OnInit } from '@angular/core';
import { EntityService } from 'src/app/services/entity.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController, NavController, MenuController, LoadingController, Platform, AlertController, PopoverController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { Base } from 'src/app/Base';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { LoadingService } from 'src/app/services/loader.service';
import { Network } from '@ionic-native/network/ngx';
import { HttpErrorResponse } from '@angular/common/http';
import { EditRequestPage } from 'src/app/edit-request/edit-request.page';
import { OverlayEventDetail } from '@ionic/core';
import { DatePipe } from '@angular/common';
import { RatingpopoverPage } from 'src/app/ratingpopover/ratingpopover.page';
import { AddSuggestionPage } from 'src/app/pages/suggestions/add-suggestion/add-suggestion.page';

@Component({
  selector: 'app-suggestion',
  templateUrl: './suggestion.page.html',
  styleUrls: ['./suggestion.page.scss'],
})
export class SuggestionPage extends Base implements OnInit {

  suggesationForm: FormGroup; searchForm: FormGroup; minToDate: Date;
  suggesationList = []; role = '';
  constructor(protected entityService: EntityService,
    private fb: FormBuilder,
    protected router: Router,
    private datePipe: DatePipe,
    private authService: AuthService,
    private navCtrl: NavController,
    public alertService: AlertService,
    protected storage: NativeStorage,
    protected menu: MenuController,
    public loadingController: LoadingController,
    public loadingServ: LoadingService,
    private modalCtrl: ModalController,
    public platform: Platform,
    public alertController: AlertController,
    public popoverController: PopoverController,
    public network: Network) {
    super(entityService, router, storage, menu, loadingController, network, platform, alertService);
    this.searchForm = this.fb.group({
      toDate: ['', [Validators.required]],
      fromDate: ['', [Validators.required]],
    });
    let newdate = new Date();
    this.searchForm.patchValue({ toDate: new Date(newdate.setDate(newdate.getDate() + 7)), fromDate: new Date("01-11-2020") });
    this.formInit();
  };

  ngOnInit() {
  }

  ionViewWillEnter() {
    if (this.online)
      this.LoadData();
    else
      this.alertService.presentToast('No network access, please check network connection');
  }

  doRefresh(event) {
    this.LoadData().then(() => {
      setTimeout(() => {
        event.target.complete();
      }, 3000);
    });
  }

  async LoadData() {
    if (this.online) {
    let user: any = this.entityService.token;
   // let userId = JSON.parse(localStorage.getItem('user')).data.roles == 'Admin' ? '' : `/${JSON.parse(localStorage.getItem('user')).data.id}`;
   let userId = user.data.roles == 'Admin' ? '' : `/${user.data.id}`;
   let entity=`suggestionbydate/${this.datePipe.transform(this.searchForm.get('fromDate').value, 'yyyy-MM-dd')}/${this.datePipe.transform(this.searchForm.get('toDate').value, 'yyyy-MM-dd')}${userId}`;
    await this.entityService.get(`general`, entity ).catch((err: HttpErrorResponse) => {
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
        this.suggesationList = result.data != null ? result.data : [];
      }
    });
  }
    else
        this.alertService.presentToast('No network access, please check network connection');
  }

  formInit(){
    this.suggesationForm = this.fb.group({
      suggest:['',Validators.required],
      user:{
        id:[0]
        }
       });
  }

  search(){

  }

  async addSuggestion(){
      const modal = await this.modalCtrl.create({
        component: AddSuggestionPage,
        componentProps: {  },
        animated: true
      });
      modal.onDidDismiss().then((detail: OverlayEventDetail) => {
        this.LoadData();
      });
      return await modal.present();
  }

}
