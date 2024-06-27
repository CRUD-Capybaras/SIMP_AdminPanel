import { Component, Injector, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import {
  PagedListingComponentBase,
  PagedRequestDto,
} from '@shared/paged-listing-component-base';
import { Observable } from 'rxjs';
import { AuthService } from '@shared/auth/SimpAPIAuth/auth.service'; // Import AuthService

class PagedTransportersRequestDto extends PagedRequestDto {
  keyword: string;
  isActive: boolean | null;
}

interface Transporter {
  id: number;
  name: string;
}

@Component({
  templateUrl: './api.component.html',
  animations: [appModuleAnimation()]
})
export class ApiComponent extends PagedListingComponentBase<Transporter> implements OnInit {
  transporters: Transporter[] = [];
  keyword = '';
  isActive: boolean | null;
  advancedFiltersVisible = false;
  isTableLoading = false;
  pageSize = 10;
  pageNumber = 1;
  totalItems = 0;
  apiUrl = 'https://w65569.eu.pythonanywhere.com/api/carriers/';

  constructor(
    injector: Injector,
    private _httpClient: HttpClient,
    private _modalService: BsModalService,
    private _authService: AuthService // Inject AuthService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    if (!this._authService.isLoggedIn()) {
      this.login();
    } else {
      this.getDataPage(1);
    }
  }

  login(): void {
    this._authService.login('admin', 'superadminwsiz').subscribe(response => {
      this._authService.setTokens(response.access, response.refresh);
      this.getDataPage(1);
    });
  }

  list(
    request: PagedTransportersRequestDto,
    pageNumber: number,
    finishedCallback: Function
  ): void {
    request.keyword = this.keyword;
    request.isActive = this.isActive;

    this.fetchTransporters().pipe(
      finalize(() => {
        finishedCallback();
      })
    ).subscribe((result: Transporter[]) => {
      this.transporters = result;
      this.totalItems = result.length;
      this.showPaging({
        items: result,
        totalCount: this.totalItems
      }, pageNumber);
    });
  }

  fetchTransporters(): Observable<Transporter[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this._authService.getAccessToken()}`
    });
    return this._httpClient.get<Transporter[]>(this.apiUrl, { headers });
  }

  createTransporter(): void {
    // Implement create transporter logic here
  }

  editTransporter(transporter: Transporter): void {
    // Implement edit transporter logic here
  }

  delete(transporter: Transporter): void {
    abp.message.confirm(
      this.l('TransporterDeleteWarningMessage', transporter.name),
      undefined,
      (result: boolean) => {
        if (result) {
          const headers = new HttpHeaders({
            'Authorization': `Bearer ${this._authService.getAccessToken()}`
          });
          this._httpClient.delete(`${this.apiUrl}/${transporter.id}`, { headers }).pipe(
            finalize(() => {
              abp.notify.success(this.l('SuccessfullyDeleted'));
              this.refresh();
            })
          ).subscribe(() => {});
        }
      }
    );
  }

  clearFilters(): void {
    this.keyword = '';
    this.isActive = undefined;
    this.getDataPage(1);
  }

  getDataPage(page: number): void {
    this.pageNumber = page;
    this.isTableLoading = true;
    this.list({ 
      keyword: this.keyword, 
      isActive: this.isActive, 
      maxResultCount: this.pageSize, 
      skipCount: (this.pageNumber - 1) * this.pageSize 
    }, page, () => {
      this.isTableLoading = false;
    });
  }

  
}
