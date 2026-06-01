import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
//import { EntryFormComponent, updateOnOption } from '../../common/entry-form-base.component';
import { InverterSchema, MaterialsService } from '../materials.service';
import { MaterialEntryEntryFormValue } from '../models';
//import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

import { EntryFormComponent, updateOnOption } from '../../../../common/entry-form-base.component';

@Component({
  selector: 'app-materials-entry-form',
  templateUrl: './materials-entry-form.component.html',
  styleUrls: ['./materials-entry-form.component.less'],
  standalone: false,
})
export class MaterialsEntryFormComponent
  extends EntryFormComponent<MaterialEntryEntryFormValue>
  implements OnInit
{
  currentSchema!: InverterSchema | null;
  visible = false;
  //private modalRef: BsModalRef;

  constructor(
    // private modal: NzModalService,
    // private viewContainerRef: ViewContainerRef,
    private fb: FormBuilder,
    public materialsService: MaterialsService, // private modalService: BsModalService
  ) {
    super();

    this.entryForm = this.fb.group(
      {
        name: ['', { validators: [Validators.required] }],
        quantity: [1, { validators: [Validators.required, Validators.min(1)] }],
        dismantledSerialNumber: [''],
        installedSerialNumber: [''],
        schemaID: [{ value: '', disabled: true }],
        schematicLabel: ['', { updateOn: 'change' }],
      },
      { updateOn: updateOnOption },
    );

    this.setInitialValue(this.entryForm.value);
  }

  override ngOnInit() {
    this.materialsService.currentSchema$.pipe(takeUntil(this.destroyed$)).subscribe((schema) => {
      this.currentSchema = schema || null; ///
      this.entryForm.get('schemaID')!.setValue(schema?.id || '');
      this.patchInitialValue({ schemaID: schema?.id || '' });
      this.onReset();
    });
  }
  onSelectFromSchema() {
    this.visible = true;
  }

  // onSelectFromSchema(template: TemplateRef<any>, tplTitle: TemplateRef<any>) {
  //   this.modal.create({
  //     // nzTitle: tplTitle,
  //     nzClosable: false,
  //     nzContent: template,
  //     nzWidth: '100%',
  //     nzViewContainerRef: this.viewContainerRef,
  //     nzData: {},
  //     nzFooter: null,
  //     nzBodyStyle: {
  //       padding: '0',
  //     },
  //   });
  //   // add modal
  //   // this.modalRef = this.modal.show(
  //   //   template,
  //   //   Object.assign({}, { class: 'materials-picker-modal' })
  //   // );
  // }

  onAddEntries(entries: MaterialEntryEntryFormValue[]) {
    this.submitFormMultiple.next(entries);
    this.visible = false;
    //  this.modal.closeAll();
    //this.modalRef.hide();
  }

  onCancel() {
    this.visible = false;
    //  this.modalRef.hide();
  }
}
