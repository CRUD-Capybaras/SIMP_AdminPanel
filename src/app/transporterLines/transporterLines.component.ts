import { Component, Injector, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import {
  PagedListingComponentBase,
  PagedRequestDto,
} from '@shared/paged-listing-component-base';
import { Observable, forkJoin } from 'rxjs';
import { AuthService } from '@shared/auth/SimpAPIAuth/auth.service';
import { CreateTransporterLinesDialogComponent } from './create-transporter-lines/create-transporterLines-dialog.component';
import { EditTransporterLinesDialogComponent } from './edit-transporter-lines/edit-transporterLines-dialog.component';
class PagedLinesRequestDto extends PagedRequestDto {
  keyword: string;
}

interface Line {
  id: number;
  name: string;
  carrier: number;
}

interface Carrier {
  id: number;
  name: string;
}

@Component({
  templateUrl: './transporterLines.component.html',
  animations: [appModuleAnimation()]
})
export class TransporterLinesComponent extends PagedListingComponentBase<Line> implements OnInit {
  protected delete(entity: Line): void {
    throw new Error('Method not implemented.');
  }
  lines: Line[] = [];
  carriers: Carrier[] = [];
  linesWithCarrierNames: any[] = [];
  keyword = '';
  isTableLoading = false;
  pageSize = 10;
  pageNumber = 1;
  totalItems = 0;
  apiUrlLines = 'https://w65569.eu.pythonanywhere.com/api/lines/';
  apiUrlCarriers = 'https://w65569.eu.pythonanywhere.com/api/carriers/';

  constructor(
    injector: Injector,
    private _httpClient: HttpClient,
    private _modalService: BsModalService,
    private _authService: AuthService
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
    request: PagedLinesRequestDto,
    pageNumber: number,
    finishedCallback: Function
  ): void {
    request.keyword = this.keyword;

    this.fetchData().pipe(
      finalize(() => {
        finishedCallback();
      })
    ).subscribe(([lines, carriers]) => {
      this.lines = lines;
      this.carriers = carriers;
      this.totalItems = lines.length;
      this.mergeData();
      this.showPaging({
        items: this.linesWithCarrierNames,
        totalCount: this.totalItems
      }, pageNumber);
    });
  }

  createLine(): void {
    this.showCreateOrEditLineDialog();
  }

  editLine(line: Line): void {
    this.showCreateOrEditLineDialog(line.id);
  }

  deleteLine(line: Line): void {
    console.log('Deleting line:', line);
    if (!line || !line.id) {
      console.error('Line is undefined or has no id property', line);
      return;
    }

    abp.message.confirm(
      this.l('LineDeleteWarningMessage', line.name),
      undefined,
      (result: boolean) => {
        if (result) {
          const headers = new HttpHeaders({
            'Authorization': `Bearer ${this._authService.getAccessToken()}`
          });
          this._httpClient.delete(`${this.apiUrlLines}${line.id}/`, { headers }).pipe(
            finalize(() => {
              abp.notify.success(this.l('SuccessfullyDeleted'));
              this.refresh();
            })
          ).subscribe(() => {});
        }
      }
    );
  }
  

  showCreateOrEditLineDialog(id?: number): void {
    let createOrEditLineDialog: BsModalRef;
    if (!id) {
      const initialState = {
        title: this.l('CreateLine')
      };
      createOrEditLineDialog = this._modalService.show(
        CreateTransporterLinesDialogComponent,
        { initialState, class: 'modal-lg' }
      );
    } else {
      const initialState = {
        title: this.l('EditLine'),
        id: id
      };
      createOrEditLineDialog = this._modalService.show(
        EditTransporterLinesDialogComponent,
        { initialState, class: 'modal-lg' }
      );
    }

    createOrEditLineDialog.content.onSave.subscribe(() => {
      this.refresh();
    });
  }

  fetchData(): Observable<[Line[], Carrier[]]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this._authService.getAccessToken()}`
    });
    const linesRequest = this._httpClient.get<Line[]>(this.apiUrlLines, { headers });
    const carriersRequest = this._httpClient.get<Carrier[]>(this.apiUrlCarriers, { headers });

    return forkJoin([linesRequest, carriersRequest]);
  }

  mergeData(): void {
    console.log('Lines:', this.lines);
    console.log('Carriers:', this.carriers);
  
    this.linesWithCarrierNames = this.lines.map(line => {
      const carrier = this.carriers.find(c => c.id === line.carrier);
      return {
        ...line,
        carrierName: carrier ? carrier.name : 'Unknown'
      };
    });
  
    console.log('Lines with Carrier Names:', this.linesWithCarrierNames);
  }

  clearFilters(): void {
    this.keyword = '';
    this.getDataPage(1);
  }

  getDataPage(page: number): void {
    this.pageNumber = page;
    this.isTableLoading = true;
    this.list({ 
      keyword: this.keyword, 
      maxResultCount: this.pageSize, 
      skipCount: (this.pageNumber - 1) * this.pageSize 
    }, page, () => {
      this.isTableLoading = false;
    });
  }
}
