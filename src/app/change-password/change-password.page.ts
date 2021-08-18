import { Component, OnInit } from '@angular/core';
import { ModalController, NavController, MenuController, LoadingController, Platform } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { EntityService } from '../services/entity.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Base } from '../Base';
import { Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { HttpErrorResponse } from '@angular/common/http';
import { MustMatch } from '../validators/mustmatch';
import { LoadingService } from '../services/loader.service';
import { Network } from '@ionic-native/network/ngx';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
})
export class ChangePasswordPage extends Base implements OnInit {

  PageTitle = 'Change Password'; subscription: any;
  pswdForm: FormGroup;

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
    public network: Network) {
    super(entityService, router, storage, menu, loadingController, network, platform, alertService);

    this.formInit();
    console.log(this.online);
  };

  ngOnInit() {
    // this.getPage();
  }

  get f() { return this.pswdForm.controls; }

  async onReset() {
    if (this.online) {
      this.loadingServ.present();
      let entity = { newPassword: this.pswdForm.get('newPassword').value, oldPassword: this.pswdForm.get('oldPassword').value }
      this.entityService.changePassword(entity).catch((err: HttpErrorResponse) => {
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
          let result = res;
          this.alertService.presentToast(`${result.message}`);
          // this.Logout();
          this.loading = false;
          this.formInit();
          this.loadingServ.dismiss();
        });
    }
    else
      this.alertService.presentToast('No network access, please check network connection');
  }

  async Logout() {

    // this.loading = true;
    await this.entityService.logout().
      subscribe((res: any) => {
        if (res) {
          let result = res;
          if (result.status == 'OK') {
            // this.toastr.success(result.message);
            localStorage.clear();
            this.router.navigate([''])
          }
        }
        else
          this.alertService.presentToast(`An error occurred while processing your request`);
        // }
        // this.loading = false;
      });
  }

  formInit() {
    this.pswdForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      cnfmPassword: ['', [Validators.required, Validators.minLength(8)]],
    }, {
      validator: MustMatch('newPassword', 'cnfmPassword')
    });
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
        this.loadingServ.dismiss();
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
