import {
    Component,
    Injector,
    OnInit,
    Output,
    EventEmitter
  } from '@angular/core';
  import { BsModalRef } from 'ngx-bootstrap/modal';
  import { AppComponentBase } from '@shared/app-component-base';
  import { HttpClient, HttpHeaders } from '@angular/common/http';
  import { finalize } from 'rxjs/operators';
  import { AuthService } from '@shared/auth/SimpAPIAuth/auth.service';
  
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
    templateUrl: 'edit-timetable-dialog.component.html'
  })
  export class EditTimetableDialogComponent extends AppComponentBase implements OnInit {
    saving = false;
    timetable: Timetable = { id: 0, time: '', day_type: 'weekday', stop: 0 };
    stops: Stop[] = [];
    id: number;
  
    @Output() onSave = new EventEmitter<any>();
  
    apiUrlTimetables = 'https://w65569.eu.pythonanywhere.com/api/timetables/';
    apiUrlStops = 'https://w65569.eu.pythonanywhere.com/api/stops/';
  
    constructor(
      injector: Injector,
      private _httpClient: HttpClient,
      private _authService: AuthService,
      public bsModalRef: BsModalRef
    ) {
      super(injector);
    }
  
    ngOnInit(): void {
      this.loadTimetable();
      this.loadStops();
    }
  
    loadTimetable(): void {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this._authService.getAccessToken()}`
      });
      this._httpClient.get<Timetable>(`${this.apiUrlTimetables}${this.id}/`, { headers }).subscribe(
        (result: Timetable) => {
          this.timetable = result;
        },
        (error) => {
          this.notify.error(this.l('FailedToLoadTimetable'));
        }
      );
    }
  
    loadStops(): void {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this._authService.getAccessToken()}`
      });
      this._httpClient.get<Stop[]>(this.apiUrlStops, { headers }).subscribe(
        (result: Stop[]) => {
          this.stops = result;
        },
        (error) => {
          this.notify.error(this.l('FailedToLoadStops'));
        }
      );
    }
  
    save(): void {
      this.saving = true;
  
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this._authService.getAccessToken()}`
      });
  
      this._httpClient.put(`${this.apiUrlTimetables}${this.id}/`, this.timetable, { headers }).pipe(
        finalize(() => {
          this.saving = false;
        })
      ).subscribe(
        () => {
          this.notify.info(this.l('SavedSuccessfully'));
          this.bsModalRef.hide();
          this.onSave.emit();
        },
        (error) => {
          this.notify.error(this.l('SaveFailed'));
        }
      );
    }
  }
  