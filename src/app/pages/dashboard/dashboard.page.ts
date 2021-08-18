import { Component, OnInit } from '@angular/core';
import { MenuController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
// import { User } from 'src/app/models/user';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  // user: User;

  public appPages = [
    {
      title: 'Blood/Platelets Request',
      url: '/request',
      icon: 'create'
    },
    {
      title: 'My Requests',
      url: '/accepted',
      icon: 'eye'
    },
    {
      title: 'Accept Request',
      url: '/donationrequest',
      icon: 'notifications'
    },
  ];
  constructor(private menu: MenuController, private authService: AuthService, private navCtrl: NavController) { 
    this.menu.enable(true);
  }

  ngOnInit() {
    
  }

  goToPage(url){
    this.navCtrl.navigateForward([url]);
  }
}