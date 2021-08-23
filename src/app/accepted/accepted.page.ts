import { Component, OnInit } from '@angular/core';
import { EntityService } from '../services/entity.service';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController, NavController, MenuController, LoadingController, Platform, AlertController, PopoverController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { Base } from '../Base';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { LoadingService } from '../services/loader.service';
import { Network } from '@ionic-native/network/ngx';
import { HttpErrorResponse } from '@angular/common/http';
import { EditRequestPage } from '../edit-request/edit-request.page';
import { OverlayEventDetail } from '@ionic/core';
import { RatingpopoverPage } from '../ratingpopover/ratingpopover.page';

@Component({
  selector: 'app-accepted',
  templateUrl: './accepted.page.html',
  styleUrls: ['./accepted.page.scss'],
})
export class AcceptedPage extends Base implements OnInit {
  PageTitle = 'Request Status';
  subscription: any;
  newList = []; tent = ''; delReqId = ''; rate = 3;
  public items: any = [];
  public itemsss: Array<{ title: string; note: string; icon: string }> = [];

  constructor(protected entityService: EntityService,
    private fb: FormBuilder,
    protected router: Router,
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
  };

  ngOnInit() {
  }

  ionViewWillEnter() {
    if (this.online)
      this.LoadData();
    else
      this.alertService.presentToast('No network access, please check network connection');
  }

  expandItem(item): void {
    if (item.expanded) {
      item.expanded = false;
    } else {
      this.records.map(listItem => {
        if (item == listItem) {
          listItem.expanded = !listItem.expanded;
        } else {
          listItem.expanded = false;
        }
        return listItem;
      });
    }
  }

  async LoadData() {
    let user: any = JSON.parse(localStorage.getItem('user'));
    this.entity = { "requesterID": user.data.id } //this.userId	
    await this.entityService.post(`acceptedRequests`, this.entity, this.entityService.httpOptions).catch((err: HttpErrorResponse) => {
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
        
        this.records = result.data != null ? result.data : [];
        this.records.forEach(e => {
          e['otherSecion'] = {}
          if(e.request.requestingBlood == 'Self' || e.request.requestingBlood == 'Any Blood'){
            e['otherSecion'] = false
          }else{
            e['otherSecion'] = true
          }
          e.requestStatusList.forEach(f => {
            Object.assign(f, { mname: '' });
          });
          Object.assign(e, { fulfill: false });
          Object.assign(e, { expanded: false });
        });
        // this.loadingServ.dismiss();
      }
      // else
      //   this.alertService.presentToast(`An error occurred while processing your request`); //this.loading = false, 
      // this.loadingServ.dismiss(), 
    });
  }

  async approval(item: any) {

    if (this.online) {
      this.loadingServ.present();
      let entData = [];
      this.newList = this.newList.filter(m => m.requestID == item.request.id);

      this.newList.forEach(e => { entData.push(e.id); });
      let requestData = entData.join();

      this.entity = { requestID: item.request.id, fulfilled: item.fulfill == true ? true : false, requestResponseIDs: requestData }; // this.userId	
      if (this.entity.fulfilled == false && this.entity.requestResponseIDs == "") {
        this.alertService.presentToasttop(`Select any responder or fulfilled`);
        this.loadingServ.dismiss();
        return;
      }

      let resp;
      this.entityService.post('donorResponse', this.entity).catch((err: HttpErrorResponse) => {
        resp = err.error;
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
        this.LoadData();
        return;
      }).then((res: any) => {
        if (res) {
          let result = res;
          if (result.status == 'OK') {
            this.newList = [];
            this.LoadData();
          }
          this.loadingServ.dismiss();
        }
        else
          this.loadingServ.dismiss(), this.alertService.presentToast(`${resp.message}`);
      });
    }
    else
      this.alertService.presentToast('No network access, please check network connection');
  }

 async check(item: any, req: any, event: any) {
    if (event.checked) {
      req.fulfilled = true;
      const alert = await this.alertController.create({
        message: 'Do you want submit the data ?',
        buttons: [{ text: 'No' }, { text: 'Yes', handler: () => {
          if(item.mname == ''){
           item.mname = 1;
      this.newList.push({ requestID: req.request.id, id: item.id, units: +item.mname });
    }
    else {
      if (this.newList.filter(f => f.requestID == req.request.id).length > 0)
        this.newList = this.newList.filter(f => f.requestID != req.request.id);
      item.mname = '';
    }
          this.approval(req); 
        } }],
      });
      await alert.present();
  }
}

  doRefresh(event) {
    this.LoadData().then(() => {
      ;
      setTimeout(() => {
        event.target.complete();
      }, 3000);
    });
  }

  async delReq() {
    let payload = { requestIDs: `${this.delReqId}` };
    await this.entityService.post('cancelRequest', payload).catch((err: HttpErrorResponse) => {
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
          // this.toastr.info(`${result.message}`);
          this.LoadData();
        }
      });
  }

  async onCancelReq(item: any) {
    this.delReqId = item.request.id;

    const alert = await this.alertController.create({
      message: 'Are you sure, want to cancel the request',
      buttons: [{ text: 'No' }, { text: 'Yes', handler: () => { this.delReq(); } }],
    });
    await alert.present();

  }

  async EditRequest(item) {
    const modal = await this.modalCtrl.create({
      component: EditRequestPage,
      componentProps: { editReqData: item },
      animated: true
    });
    modal.onDidDismiss().then((detail: OverlayEventDetail) => {
      this.LoadData();
    });
    return await modal.present();
  }

  async presentPopover(item) {
    const popover = await this.popoverController.create({
      component: RatingpopoverPage,
      componentProps: { ratedata: item, lst: this.newList },
      animated: true
    });
    popover.onDidDismiss().then((detail: OverlayEventDetail) => {
      this.LoadData();
    });
    return await popover.present();
  }

  onSubmit(item: any) {
    if (item.fulfill)
      this.presentPopover(item);
    else
      this.approval(item);
  }

  openPrescription(url:string){
    window.open(url);
  }

  getGender(id: string){
    let a = this.master.GenderMaster.filter(data=> data.id == id)
    return a[0].name;
  }

}





