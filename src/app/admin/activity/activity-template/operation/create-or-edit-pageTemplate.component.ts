import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';
import { HtmlTemplateServiceProxy, CreateHtmlTemplateInput,UpdateHtmlTemplateInput,CreateHtmlTemplateInputTemplateType } from '@shared/service-proxies/service-proxies5';


@Component({
  selector: 'pageTemplateModalComponent',
  templateUrl: './create-or-edit-pageTemplate.component.html',
  styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
  ]
})
export class PageTemplateModalComponent extends AppComponentBase implements AfterViewChecked {

  @ViewChild('createOrEditModal',{static:true}) modal: ModalDirective;

  @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

  active = false;
  saving = false;
  operation: string = "add";
  Template: any = {};

  constructor(
    injector: Injector,
    private _HtmlTemplateService: HtmlTemplateServiceProxy
  ) {
    super(injector);
  }

  ngAfterViewChecked(): void {

  }





  show(Template?: any): void {
    this.active = true;
    if (Template) {
      this.operation = "edit";
      this.Template = new UpdateHtmlTemplateInput(Template);
      console.log(this.Template)
    } else {
      this.operation = "add";
      this.Template = new CreateHtmlTemplateInput(this.Template);
    }
    this.modal.show();
  }

  onShown(): void {

  }

  save(): void {
    this.saving = true;
    if (this.operation == "add") {
      this._HtmlTemplateService.createHtmlTemplate(this.Template).pipe(finalize(() => { this.saving = false; }))
        .subscribe(() => {
          this.modalSave.emit(null);
          this.notify.info(this.l('SavedSuccessfully'));
          this.close();
        });
    } else {
      this._HtmlTemplateService.updateHtmlTemplate(this.Template).pipe(finalize(() => { this.saving = false; }))
        .subscribe(() => {
          this.modalSave.emit(null);
          this.notify.info(this.l('SavedSuccessfully'));
          this.close();
        });
    }

  }

  close(): void {
    this.active = false;
    this.Template = null;
    this.saving = false;
    this.modal.hide();
  }
  thumbnailOnUpload(r): void {
    this.Template.thumbnail = r.fileUri;
  }
  logoOnUpload(r): void {
    this.Template.logo = r.fileUri;
  }
  backgroundOnUpload(r) {
    this.Template.backgroundImage = r.fileUri;
  }
  bigPicOnUpload(r) {
    this.Template.bigImage = r.fileUri;
  }
}
