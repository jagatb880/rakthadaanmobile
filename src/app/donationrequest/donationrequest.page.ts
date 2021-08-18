import { Component, OnInit } from '@angular/core';
import { EntityService } from '../services/entity.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController, NavController, MenuController, LoadingController, Platform, PopoverController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { Base } from '../Base';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { HttpErrorResponse } from '@angular/common/http';
import { NotePage } from '../note/note.page';
import { PopoverPage } from '../popover/popover.page'
import { OverlayEventDetail } from '@ionic/core';
import { LoadingService } from '../services/loader.service';
import { Network } from '@ionic-native/network/ngx';

@Component({
  selector: 'app-donationrequest',
  templateUrl: './donationrequest.page.html',
  styleUrls: ['./donationrequest.page.scss'],
})
export class DonationrequestPage extends Base implements OnInit {
  PageTitle = 'Request Received';
  subscription: any; tent = '';

  constructor(protected entityService: EntityService,
    private fb: FormBuilder,
    protected router: Router,
    private modalController: ModalController,
    private authService: AuthService,
    private navCtrl: NavController,
    public alertService: AlertService,
    protected storage: NativeStorage,
    protected menu: MenuController,
    public loadingController: LoadingController,
    public platform: Platform,
    private modalCtrl: ModalController,
    public loadingServ: LoadingService,
    private popoverController: PopoverController,
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

  async LoadData() {
    // this.loadingServ.present();
    this.entity = { responderID: this.entityService.userId }
    await this.entityService.post(`donationRequest`, this.entity).catch((err: HttpErrorResponse) => {
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
          // this.loadingServ.dismiss();
          let result = res;
          this.records = result.data == null ? [] : result.data;
        }
        // else
        //   this.alertService.presentToast('An error occurred while processing your request');
      });
  }

  async termsModal() {
    const termsModal = await this.modalController.create({
      component: NotePage,
    });
    return await termsModal.present();
  }

  doRefresh(event) {
    this.LoadData().then(() => { setTimeout(() => { event.target.complete(); }, 2000); });
  }

  async presentPopover(item, ev: any) {
    const popover = await this.popoverController.create({
      component: PopoverPage,
      // event: ev,
      componentProps: { data: item },
      // backdropDismiss: true,
      animated: true
    });
    popover.onDidDismiss().then((detail: OverlayEventDetail) => {
      this.LoadData();
    });
    return await popover.present();
  }
}


