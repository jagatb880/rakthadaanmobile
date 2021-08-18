import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-plasma-terms',
  templateUrl: './plasma-terms.page.html',
  styleUrls: ['./plasma-terms.page.scss'],
})
export class PlasmaTermsPage implements OnInit {

  constructor(
    private popoverctrl: PopoverController
  ) { }

  ngOnInit() {
  }

  onSave() {
    this.popoverctrl.dismiss('save');
  }

  cancel() {
    this.popoverctrl.dismiss();
  }


}
