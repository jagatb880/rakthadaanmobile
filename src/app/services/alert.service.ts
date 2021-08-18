import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private toastController: ToastController) { }

  async presentToast(message: any) {
    const toast = await this.toastController.create({
      message: message,
      duration: 1500,
      position: 'bottom',
      color: 'dark'
    });
    toast.present();
  }

  async presentToasttop(message: any) {
    const toast = await this.toastController.create({
      message: message,
      duration: 1500,
      position: 'top',
      color: 'dark'
    });
    toast.present();
  }

  async presentToastmiddle(message: any) {
    const toast = await this.toastController.create({
      message: message,
      duration: 1500,
      position: 'middle',
      color: 'dark'
    });
    toast.present();
  }

  async customToast(message: any){
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position : 'top',
      cssClass: 'my-custom-class',
      // showCloseButton: true,
      // closeButtonText: 'Yeah',
    });
    toast.present();
  }
}