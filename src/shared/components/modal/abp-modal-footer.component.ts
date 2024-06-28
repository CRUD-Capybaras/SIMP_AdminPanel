import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  Injector
} from '@angular/core';
import { AppComponentBase } from '@shared/app-component-base';

@Component({
  selector: 'abp-modal-footer',
  templateUrl: './abp-modal-footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AbpModalFooterComponent extends AppComponentBase {
  @Input() cancelLabel = this.l('Anuluj');
  @Input() cancelDisabled: boolean;
  @Input() saveLabel = this.l('Zapisz');
  @Input() saveDisabled: boolean;

  @Output() onCancelClick = new EventEmitter<number>();

  constructor(injector: Injector) {
    super(injector);
  }
}
