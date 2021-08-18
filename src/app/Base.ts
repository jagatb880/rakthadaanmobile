import { OnInit } from '@angular/core';
import { EntityService } from './services/entity.service';
import { Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { MenuController, LoadingController, Platform } from '@ionic/angular';
import { HttpErrorResponse } from '@angular/common/http';
import { Network } from '@ionic-native/network/ngx';
import { AlertService } from './services/alert.service';
// declare const $: any;

export class Base implements OnInit {

  item: IList[];
  master: any = {
    'GenderMaster': this.item,
    // 'StateMaster': this.item,
  };

  roleList = []; records = []; checkList = []; records1 = []; checkedList: number[] = []; permissions: string[] = [];
  districtList: any[] = []; mandalList: any[] = []; stateList = [];

  userName: string; user: any; mode: String; entity: any; entityName: any; userInfo: any; methodnme: any; userId: number;

  totalPages: number = 0; pageNum = 0; recordsPerPage = 20; pageNumber: number = 0; changePageNo: number; online: boolean = true;
  bloodgrps = [{ name: 'A-' }, { name: 'A+' }, { name: 'B-' }, { name: 'B+' }, { name: 'O+' }, { name: 'O-' }, { name: 'AB+' }, { name: 'AB-' },{name: 'No Idea'}];

  loading: any;
  constructor(
    protected entityService: EntityService,
    protected router: Router,
    protected storage: NativeStorage,
    protected menu: MenuController,
    public loadingController: LoadingController,
    public network: Network,
    public platform: Platform,
    public alertService: AlertService,) {
    this.menu.enable(true);
    this.user = JSON.parse(localStorage.getItem('user'));
    this.userInfo = this.storage.getItem('token');

    this.userId = this.entityService.token == undefined ? 0 : this.entityService.token.data.id;

    for (const item of Object.keys(this.master)) {
      this.entityName = item.replace(/_/g, ' ');
      this.couchEntities();
    }

    this.platform.ready().then(() => {
      if (this.platform.is('hybrid')) {
      let type = this.network.type;

      if(type == "unknown" || type == "none" || type == undefined){
        this.online = false;
        alertService.presentToast('No network access, please check network connection');
      }else{
        this.online = true;
      }
      }
    });

    this.network.onDisconnect().subscribe( () => {
      this.online = false;
      alertService.presentToast('No network access, please check network connection');
    });

    this.network.onConnect().subscribe( () => {
      this.online = true;
    });

  }

  ngOnInit() {
  }

  async couchEntities() {
    let name = this.entityName;
    await this.entityService.couchEntities(name).then((res: any) => {
      if (res) {
        let result = res;
        if (result.data) {
          this.master[name.replace(/ /g, '_')] = result.data.map(row => this.pick(row, ['id', 'name', 'scheduleCasteType', 'castettype', 'shortName']));
          this.sortList(this.master[name.replace(/ /g, '_')]);
        }
      }
      //   else
      //     this.toastr.error(`An error occurred while processing your request`);
    });
  }

  pick(obj, keys) {
    return keys.map(k => k in obj ? { [k]: obj[k] } : {})
      .reduce((res, o) => Object.assign(res, o), {});
  }

  editEntity(entity: any) {
    this.entity = entity;
    this.mode = "Update";
  }

  confirm(OKAndCancel: boolean) {
    if (OKAndCancel)
      this.deleteEntities();

    // $('#myModal_delete').modal('hide');
  }

  sortList(list: any) {
    list.sort((a, b) => (a.name === b.name) ? 0 : (a.name > b.name) ? 1 : -1);
  }

  async saveEntity(bundle) {
    await this.entityService.onSave(this.entityName, bundle).subscribe((res: any) => {
      //   if (res.status == 'OK')
      // this.toastr.success(`${res.message}`);
    })
  }

  async getPage() {
    await this.entityService.pagination(this.entityName, this.pageNum, this.recordsPerPage).
      then((res: any) => {
        if (res) {
          let result = res;
          if (result.data) {
            this.records = result.data.content;
            this.totalPages = result.data.totalPages;
            //   this.pageService.setPages = this.totalPages;
            //   this.pageService.setTableData = this.records;
            //   this.pageService.setPageNumber = this.pageNumber;
          }
        }
        // else
        //   this.loading = false, this.toastr.error(`An error occurred while processing your request`);
      });
  }

  checkUncheckEntity(item: any, id: number) {
    if (item.checked) {
      this.checkList.push(id);
    } else if (this.checkList.includes(id)) {
      this.checkList.splice(this.checkList.indexOf(id), 1);
    }
    this.checkList.sort((a, b) => a - b);
  }

  check_All(status: any) {
    this.checkList = [];
    if (status.checked) {
      this.records.forEach(element => this.checkList.push(element.id));
    }
  }

  async deleteEntities(isPageNation: boolean = true) {
    if (this.checkList.length <= 0)
      return;

    let requestData = this.checkList.join();

    await this.entityService.deleteByIds(this.entityName, requestData).
      subscribe((res: any) => {
        this.checkList = [];
        if (res) {
          let result = res;
          if (result.status == 'OK') {
            if (isPageNation)
              this.getPage();
          }
          //   else
          //     this.toastr.error('Failed to delete');
        }
        // else
        //   this.toastr.error(`An error occurred while processing your request`);
      });
  }

  //   checkPermission(permission: string) {
  //     return this.permissionsService.checkPermission(permission, this.userName);
  //   }

  firstPage() {
    this.pageNumber = 0;
    this.getPage();
  }

  previousPage() {
    if (this.pageNumber > 0) {
      this.pageNumber--;
      this.getPage();
    }
  }

  nextPage() {
    if (this.pageNumber < this.totalPages - 1) {
      this.pageNumber++;
      this.getPage();
    }
  }

  lastPage() {
    this.pageNumber = this.totalPages - 1;
    this.getPage();
  }

  changePage(id: number) {
    if (id > 0 && this.totalPages >= id && id <= this.totalPages) {
      this.pageNumber = id - 1;
      this.getPage();
    }
    else if (id <= 0)
      alert(`Please enter grater than 0`);
    else
      alert(`Please enter 1 to ${this.totalPages}`);
  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      message: 'Loading...'
    });
    await this.loading.present();
  }

  LoadStates() {
    // this.loading = true;
    this.entityService.get('domain', 'supportedStates').catch((err: HttpErrorResponse) => {
      // this.loading = false, this.toastr.error(`An error occurred while processing your request`); 
      return;
    }).then((res: any) => {
      // this.loading = false;
      if (res.status == 'OK') {
        this.stateList = res.data;

      }
    });
  }

}
export interface IList {
  id: number;
  name: string;
}