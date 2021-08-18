import { Component, OnInit, Input } from '@angular/core';
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
import { OverlayEventDetail } from '@ionic/core';
import { Network } from '@ionic-native/network/ngx';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.page.html',
  styleUrls: ['./popover.page.scss'],
})
export class PopoverPage extends Base implements OnInit {

  @Input() data;

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
    private popoverController: PopoverController,
    public network: Network) {
    super(entityService, router, storage, menu, loadingController, network, platform,alertService);
  };

  ngOnInit() {
  }

  statusChange(val, item) {
    if(this.online) {
    this.entity = { id: item.id, status: val };
    this.entityService.post('acceptRequest', this.entity).catch((err: HttpErrorResponse) => {
      this.alertService.presentToast('An error occurred while processing your request');
      return;
    }).then((res: any) => {
      if (res) {
        let result = res;
        if (result.status == 'OK') {
          this.popoverController.dismiss({
            'dismissed': true
          });
          this.alertService.presentToast('Saved Successfully');
        }
      }
      else
        this.alertService.presentToast('An error occurred while processing your request');
    });
  }
  else
  this.alertService.presentToast('No network access, please check network connection');
  }

}
