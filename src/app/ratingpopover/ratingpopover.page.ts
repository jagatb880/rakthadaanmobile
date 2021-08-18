import { Component, OnInit, Input } from '@angular/core';
import { EntityService } from '../services/entity.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController, NavController, MenuController, LoadingController, Platform, PopoverController, NavParams } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { Base } from '../Base';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { HttpErrorResponse } from '@angular/common/http';
import { NotePage } from '../note/note.page';
import { OverlayEventDetail } from '@ionic/core';
import { Network } from '@ionic-native/network/ngx';

@Component({
  selector: 'app-ratingpopover',
  templateUrl: './ratingpopover.page.html',
  styleUrls: ['./ratingpopover.page.scss'],
})
export class RatingpopoverPage extends Base implements OnInit {

  @Input() rateData;
  // @Input() lst : any;

  ratingForm = new FormGroup({});
  rate = ''; newList = []; item: any; subscription: any;

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
    public network: Network,
    public navParams: NavParams) {
    super(entityService, router, storage, menu, loadingController, network, platform,alertService);

    this.formInit();
    this.newList  = navParams.get('lst');
    this.item  = navParams.get('ratedata');
  };

  ngOnInit() {
  }

  ionViewWillEnter() {
  }

  formInit() {
    this.ratingForm = this.fb.group({
      rate: ['5'],
      feedback: ['']
    });
  }

  async save() {

    if (this.online) {
      let entData = [];
      this.newList = this.newList.filter(m => m.requestID == this.item.request.id);

      this.newList.forEach(e => { entData.push(e.id); });
      let requestData = entData.join();

      this.entity = { requestID: this.item.request.id, fulfilled: this.item.fulfill == true ? true : false, requestResponseIDs: requestData, rating: this.ratingForm.value.rate, feedback: this.ratingForm.value.feedback }; // this.userId	

      this.entityService.post('donorResponse', this.entity).catch((err: HttpErrorResponse) => {
        let resp = err.error; 
        this.popoverController.dismiss({'dismissed': true});
        this.alertService.presentToast(`${resp.message}`);
        return ;
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
