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
  
  interface Transporter {
    id: number;
    name: string;
  }
  
  @Component({
    templateUrl: 'edit-transporter-dialog.component.html'
  })
  export class EditTransporterDialogComponent extends AppComponentBase implements OnInit {
    saving = false;
    transporter: Transporter = { id: 0, name: '' };
    id: number;
  
    @Output() onSave = new EventEmitter<any>();
  
    apiUrl = 'https://w65569.eu.pythonanywhere.com/api/carriers/';
  
    constructor(
      injector: Injector,
      private _httpClient: HttpClient,
      private _authService: AuthService,
      public bsModalRef: BsModalRef
    ) {
      super(injector);
    }
  
    ngOnInit(): void {
      this.loadTransporter();
    }
  
    loadTransporter(): void {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this._authService.getAccessToken()}`
      });
      this._httpClient.get<Transporter>(`${this.apiUrl}${this.id}/`, { headers }).subscribe(
        (result: Transporter) => {
          this.transporter = result;
        }
      );
    }
  
    save(): void {
      this.saving = true;
  
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this._authService.getAccessToken()}`
      });
  
      this._httpClient.put(`${this.apiUrl}${this.id}/`, this.transporter, { headers }).pipe(
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
  