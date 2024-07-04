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
  
  interface CreateLineDto {
    name: string;
    carrier: number;
  }
  
  interface Carrier {
    id: number;
    name: string;
  }
  
  @Component({
    templateUrl: 'create-transporterLines-dialog.component.html'
  })
  export class CreateTransporterLinesDialogComponent extends AppComponentBase implements OnInit {
    saving = false;
    line: CreateLineDto = { name: '', carrier: 0 };
    carriers: Carrier[] = [];
  
    @Output() onSave = new EventEmitter<any>();
  
    apiUrlLines = 'https://w65569.eu.pythonanywhere.com/api/lines/';
    apiUrlCarriers = 'https://w65569.eu.pythonanywhere.com/api/carriers/';
  
    constructor(
      injector: Injector,
      private _httpClient: HttpClient,
      private _authService: AuthService,
      public bsModalRef: BsModalRef
    ) {
      super(injector);
    }
  
    ngOnInit(): void {
      this.loadCarriers();
    }
  
    loadCarriers(): void {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this._authService.getAccessToken()}`
      });
  
      this._httpClient.get<Carrier[]>(this.apiUrlCarriers, { headers }).subscribe(
        (result: Carrier[]) => {
          this.carriers = result;
        },
        (error) => {
          this.notify.error(this.l('FailedToLoadCarriers'));
        }
      );
    }
  
    save(): void {
      this.saving = true;
  
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this._authService.getAccessToken()}`
      });
  
      this._httpClient.post(this.apiUrlLines, this.line, { headers }).pipe(
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
  