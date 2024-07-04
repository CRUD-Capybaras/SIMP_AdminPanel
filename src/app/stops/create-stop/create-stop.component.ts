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
  
  interface CreateStopDto {
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
    templateUrl: 'create-stop.component.html'
  })
  export class CreateStopDialogComponent extends AppComponentBase implements OnInit {
    saving = false;
    stop: CreateStopDto = { name: '', latitude: 0, longitude: 0, line: 0, previous_stop: null };
    lines: Line[] = [];
  
    @Output() onSave = new EventEmitter<any>();
  
    apiUrlStops = 'https://w65569.eu.pythonanywhere.com/api/stops/';
    apiUrlLines = 'https://w65569.eu.pythonanywhere.com/api/lines/';
  
    constructor(
      injector: Injector,
      private _httpClient: HttpClient,
      private _authService: AuthService,
      public bsModalRef: BsModalRef
    ) {
      super(injector);
    }
  
    ngOnInit(): void {
      this.loadLines();
    }
  
    loadLines(): void {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this._authService.getAccessToken()}`
      });
  
      this._httpClient.get<Line[]>(this.apiUrlLines, { headers }).subscribe(
        (result: Line[]) => {
          this.lines = result;
        },
        (error) => {
          this.notify.error(this.l('FailedToLoadLines'));
        }
      );
    }
  
    save(): void {
      this.saving = true;
  
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this._authService.getAccessToken()}`
      });
  
      this._httpClient.post(this.apiUrlStops, this.stop, { headers }).pipe(
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
  