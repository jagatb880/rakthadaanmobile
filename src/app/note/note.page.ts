import { Component, OnInit } from '@angular/core';
import { ModalController, Platform, MenuController } from '@ionic/angular';

@Component({
  selector: 'app-note',
  templateUrl: './note.page.html',
  styleUrls: ['./note.page.scss'],
})
export class NotePage implements OnInit {

  canGoBack : boolean = false; subscription: any;
  constructor(private modalController: ModalController,
    private platform: Platform,
  private menu: MenuController) { }

  ngOnInit() {
  }

  
  dismissRegister() {
    this.modalController.dismiss();
  }  

  goBack() {
    this.dismissRegister();
  }

  ionViewDidEnter() {
    this.subscription = this.platform.backButton.subscribe(async () => {

      const element = await this.menu.getOpen();
        if (element) {
          this.menu.close();
          return;
        }
        else
        this.dismissRegister();
    });
  }

  ionViewWillLeave() {
    this.subscription.unsubscribe();
  }

}
