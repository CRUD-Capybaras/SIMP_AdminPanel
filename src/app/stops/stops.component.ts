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
import { CreateStopDialogComponent } from './create-stop/create-stop.component';
import { EditStopDialogComponent } from './edit-stop/edit-stop.component';

class PagedStopsRequestDto extends PagedRequestDto {
  keyword: string;
}

interface Stop {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  line: number;
  previous_stop: number | null;
}

interface Line {
  id: number;
  name: string;
}

@Component({
  templateUrl: './stops.component.html',
  animations: [appModuleAnimation()]
})
export class StopsComponent extends PagedListingComponentBase<Stop> implements OnInit {
  protected delete(entity: Stop): void {
      throw new Error('Method not implemented.');
  }
  stops: Stop[] = [];
  lines: Line[] = [];
  stopsWithLineNames: any[] = [];
  keyword = '';
  isTableLoading = false;
  pageSize = 10;
  pageNumber = 1;
  totalItems = 0;
  apiUrlStops = 'https://w65569.eu.pythonanywhere.com/api/stops/';
  apiUrlLines = 'https://w65569.eu.pythonanywhere.com/api/lines/';

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
    request: PagedStopsRequestDto,
    pageNumber: number,
    finishedCallback: Function
  ): void {
    request.keyword = this.keyword;

    this.fetchData().pipe(
      finalize(() => {
        finishedCallback();
      })
    ).subscribe(([stops, lines]) => {
      this.stops = stops;
      this.lines = lines;
      this.totalItems = stops.length;
      this.mergeData();
      this.showPaging({
        items: this.stopsWithLineNames,
        totalCount: this.totalItems
      }, pageNumber);
    });
  }

  fetchData(): Observable<[Stop[], Line[]]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this._authService.getAccessToken()}`
    });
    const stopsRequest = this._httpClient.get<Stop[]>(this.apiUrlStops, { headers });
    const linesRequest = this._httpClient.get<Line[]>(this.apiUrlLines, { headers });

    return forkJoin([stopsRequest, linesRequest]);
  }

  mergeData(): void {
    console.log('Stops:', this.stops);
    console.log('Lines:', this.lines);

    this.stopsWithLineNames = this.stops.map(stop => {
      const line = this.lines.find(l => l.id === stop.line);
      return {
        ...stop,
        lineName: line ? line.name : 'Unknown'
      };
    });

    console.log('Stops with Line Names:', this.stopsWithLineNames);
  }

  createStop(): void {
    this.showCreateOrEditStopDialog();
  }

  editStop(stop: Stop): void {
    this.showCreateOrEditStopDialog(stop.id);
  }

  deleteStop(stop: Stop): void {
    console.log('Deleting stop:', stop);
    if (!stop || !stop.id) {
      console.error('Stop is undefined or has no id property', stop);
      return;
    }

    abp.message.confirm(
      this.l('StopDeleteWarningMessage', stop.name),
      undefined,
      (result: boolean) => {
        if (result) {
          const headers = new HttpHeaders({
            'Authorization': `Bearer ${this._authService.getAccessToken()}`
          });
          this._httpClient.delete(`${this.apiUrlStops}${stop.id}/`, { headers }).pipe(
            finalize(() => {
              abp.notify.success(this.l('SuccessfullyDeleted'));
              this.refresh();
            })
          ).subscribe(() => {});
        }
      }
    );
  }

  showCreateOrEditStopDialog(id?: number): void {
    let createOrEditStopDialog: BsModalRef;
    if (!id) {
      const initialState = {
        title: this.l('CreateStop')
      };
      createOrEditStopDialog = this._modalService.show(
        CreateStopDialogComponent,
        { initialState, class: 'modal-lg' }
      );
    } else {
      const initialState = {
        title: this.l('EditStop'),
        id: id
      };
      createOrEditStopDialog = this._modalService.show(
        EditStopDialogComponent,
        { initialState, class: 'modal-lg' }
      );
    }

    createOrEditStopDialog.content.onSave.subscribe(() => {
      this.refresh();
    });
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
