// import { Injectable } from '@angular/core';
// import { map } from 'rxjs/operators';

// @Injectable({
//     providedIn: 'root'
// })
// export class PermissionsService {

//     permissionsArray: String[] = [];

//     constructor() {
//         const permissions = localStorage.getItem('permissionsArray');
//         if (permissions)
//             this.permissionsArray = JSON.parse(permissions);
//     }

//     savePermissions(permissionsStr: string) {
//         if (permissionsStr) {
//             this.permissionsArray = [...new Set(permissionsStr.split(","))];
//             localStorage.setItem('permissionsArray', JSON.stringify(this.permissionsArray));
//         }
//     }

//     checkPermission(permission: string, userName: string) {
//         let b = (userName == 'Admin') ? true : this.permissionsArray.includes(permission);
//         return b;
//     }
// }