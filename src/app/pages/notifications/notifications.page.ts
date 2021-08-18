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

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage extends Base implements OnInit {
  notificationsList = []; subscription: any;
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
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    if (this.online)
      this.LoadNotifications();
    else
      this.alertService.presentToast('No network access, please check network connection');
  }

  doRefresh(event) {
    this.LoadNotifications().then(() => {
      setTimeout(() => {
        event.target.complete();
      }, 3000);
    });
  }


  async LoadNotifications() {
    if (this.online) {
      await this.entityService.get(`general`, 'getnotifications').catch((err: HttpErrorResponse) => {
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
          this.notificationsList = result.data != null ? result.data : [];
        }
      });
    }
    else
      this.alertService.presentToast('No network access, please check network connection');

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

}
