import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class PageService {
  private language = new BehaviorSubject<number>(0);
  Language = this.language.asObservable();

  private totalPages = new BehaviorSubject<number>(0);
  total_Pages = this.totalPages.asObservable();

  private entityname = new BehaviorSubject<string>('');
  entity_Name = this.entityname.asObservable();

  private mthdname = new BehaviorSubject<string>('');
  mthd_Name = this.mthdname.asObservable();

  private tableData = new BehaviorSubject<any>([]);
  table_Data = this.tableData.asObservable();

  private entity = new BehaviorSubject<any>([]);
  entity_data = this.entity.asObservable();

  private pageNumber = new BehaviorSubject<number>(0);
  page_Number = this.pageNumber.asObservable();

  private recordsPerPage = new BehaviorSubject<number>(20);
  records_PerPage = this.recordsPerPage.asObservable();

  private changePageNo = new BehaviorSubject<number>(0);
  change_PageNo = this.recordsPerPage.asObservable();

  constructor() { }

  set setLanguage(lngId: number) {
    this.language.next(lngId);
  }

  set setPages(count: number) {
    this.totalPages.next(count);
  }

  set setEntity(entityName: string) {
    this.entityname.next(entityName);
  }

  set setMethod(mthdName: string) {
    this.mthdname.next(mthdName);
  }

  set setEntityData(data: any) {
    this.entity.next(data);
  }

  set setTableData(data: any) {
    this.tableData.next(data);
  }

  set setPageNumber(pageNo: number) {
    this.pageNumber.next(pageNo);
  }
  
  set setRecordsPerPage(perPage: number) {
    this.recordsPerPage.next(perPage);
  }

  set setChangePageNo(pageNo: number) {
    this.changePageNo.next(pageNo);
  }
}
