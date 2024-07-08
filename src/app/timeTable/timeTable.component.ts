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
import { CreateTimetableDialogComponent } from './create-timeTable/create-timetable-dialog.component';
import { EditTimetableDialogComponent } from './edit-timeTable/edit-timetable-dialog.component';

class PagedTimetablesRequestDto extends PagedRequestDto {
  keyword: string;
}

interface Timetable {
  id: number;
  time: string;
  day_type: string;
  stop: number;
}

interface Stop {
  id: number;
  name: string;
}

@Component({
  templateUrl: './timeTable.component.html',
  animations: [appModuleAnimation()]
})
export class TimeTableComponent extends PagedListingComponentBase<Timetable> implements OnInit {
  protected delete(entity: Timetable): void {
      throw new Error('Method not implemented.');
  }
  timetables: Timetable[] = [];
  stops: Stop[] = [];
  timetablesWithStopNames: any[] = [];
  keyword = '';
  isTableLoading = false;
  pageSize = 10;
  pageNumber = 1;
  totalItems = 0;
  apiUrlTimetables = 'https://w65569.eu.pythonanywhere.com/api/timetables/';
  apiUrlStops = 'https://w65569.eu.pythonanywhere.com/api/stops/';

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
    request: PagedTimetablesRequestDto,
    pageNumber: number,
    finishedCallback: Function
  ): void {
    request.keyword = this.keyword;

    this.fetchData().pipe(
      finalize(() => {
        finishedCallback();
      })
    ).subscribe(([timetables, stops]) => {
      this.timetables = timetables;
      this.stops = stops;
      this.totalItems = timetables.length;
      this.mergeData();
      this.showPaging({
        items: this.timetablesWithStopNames,
        totalCount: this.totalItems
      }, pageNumber);
    });
  }

  fetchData(): Observable<[Timetable[], Stop[]]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this._authService.getAccessToken()}`
    });
    const timetablesRequest = this._httpClient.get<Timetable[]>(this.apiUrlTimetables, { headers });
    const stopsRequest = this._httpClient.get<Stop[]>(this.apiUrlStops, { headers });

    return forkJoin([timetablesRequest, stopsRequest]);
  }

  mergeData(): void {
    console.log('Timetables:', this.timetables);
    console.log('Stops:', this.stops);

    this.timetablesWithStopNames = this.timetables.map(timetable => {
      const stop = this.stops.find(s => s.id === timetable.stop);
      return {
        ...timetable,
        stopName: stop ? stop.name : 'Unknown'
      };
    });

    console.log('Timetables with Stop Names:', this.timetablesWithStopNames);
  }

  createTimetable(): void {
    this.showCreateOrEditTimetableDialog();
  }

  editTimetable(timetable: Timetable): void {
    this.showCreateOrEditTimetableDialog(timetable.id);
  }
  
  showCreateOrEditTimetableDialog(id?: number): void {
    let createOrEditTimetableDialog: BsModalRef;
    if (!id) {
      const initialState = {
        title: this.l('CreateTimetable')
      };
      createOrEditTimetableDialog = this._modalService.show(
        CreateTimetableDialogComponent,
        { initialState, class: 'modal-lg' }
      );
    } else {
      const initialState = {
        title: this.l('EditTimetable'),
        id: id
      };
      createOrEditTimetableDialog = this._modalService.show(
        EditTimetableDialogComponent,
        { initialState, class: 'modal-lg' }
      );
    }
  
    createOrEditTimetableDialog.content.onSave.subscribe(() => {
      this.refresh();
    });
  }
  

  deleteTimetable(timetable: Timetable): void {
    abp.message.confirm(
      this.l('TimeTableDeleteWarningMessage', timetable.id),
      undefined,
      (result: boolean) => {
        if (result) {
          const headers = new HttpHeaders({
            'Authorization': `Bearer ${this._authService.getAccessToken()}`
          });
          this._httpClient.delete(`${this.apiUrlTimetables}${timetable.id}/`, { headers }).subscribe(() => {
            abp.notify.success(this.l('SuccessfullyDeleted'));
            this.refresh();
          }, error => {
            console.error('ERROR', error);
            abp.notify.error(this.l('DeleteFailed'));
          });
        }
      }
    );
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
