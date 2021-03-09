import { Component, OnInit, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { CreateOrEditCateModalComponent } from '@app/admin/category/category/create-or-edit-cate-modal.component';
import { ProductCategoryServiceProxy, UpdateProductCategoryInput, BrandServiceProxy, UpdateBrandCategoryInput } from '@shared/service-proxies/service-proxies';
import { MyTreeComponent } from '@app/shared/common/my-tree/my-tree.component';
import { finalize } from 'rxjs/operators';
import { CategoryTreeComponent } from './category-tree.component';
import { UpdateQuestionCategoryInput, OperationKnowledgeServiceProxy } from '@shared/service-proxies/service-proxies3';
import { CreateOrEditSolCatModalComponent } from '@app/admin/category/category/operation/create-or-edit-solutionCategory-modal.component';
import { TenantServiceProxy } from '@shared/service-proxies/service-proxies';

import { ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class CategoryComponent extends AppComponentBase {

  @ViewChild('createOrEditCateModal',{static:true}) createOrEditCateModal: CreateOrEditCateModalComponent;
  @ViewChild('createOrEditSolCatModal',{static:false}) createOrEditSolCatModal: CreateOrEditSolCatModalComponent;
  @ViewChild('tree',{static:false}) tree: CategoryTreeComponent;

  @ViewChild('dataTable',{static:false}) dataTable: Table;
  @ViewChild('paginator',{static:false}) paginator: Paginator;


  // @ViewChild('TenantCombobox') tenantComboboxElement: ElementRef;


  updateProductCategory: UpdateProductCategoryInput;
  updateQuestionCategoryInput: UpdateQuestionCategoryInput;

  treeConfig: any = {
    'selectable': false,
    'showIcon': window.location.pathname.split('\/')[window.location.pathname.split('\/').length - 1] == 'questionType' ? false : true,
    'menu': true,
    'selecionMode': 1,
    'showId': true,
    'needFilter': true
  }
  categoryList: any[] = [];
  haveCategory = true;

  type = '';


  filterText = '';
  selectedList: any = [];

  questionTypeList: any = [];
  questionTypeId: any = "";
  tenantId: any = "";
  tenants: any = [];
  treeBusy;

  constructor(injector: Injector,
    private router: Router,
    private _activatedRoute: ActivatedRoute,
    private _cateService: ProductCategoryServiceProxy,
    private _KnowledgeCategoryServiceProxy: OperationKnowledgeServiceProxy,
    private _tenantService: TenantServiceProxy,
    private _brandServiceProxy: BrandServiceProxy
  ) {
    super(injector);



    this._activatedRoute.queryParams.subscribe(queryParams => {
      this.tenantId = queryParams.tenantId ? queryParams.tenantId : '';
      console.log('tenantId', this.tenantId)
    })



    var urls = window.location.pathname.split('\/');
    this.type = urls[urls.length - 1];

    console.log(this.type)

    if (this.type == 'transfer') {
      this.router.navigate(['app', 'category', 'maintain', 'questionType'], { queryParams: { tenantId: this.tenantId } });
      return
    }

    this.getCateTree();


    if (this.type == 'questionType') {
      this._tenantService.getTenants("", undefined, undefined, undefined, undefined, 0, false, undefined, 1000, 0).subscribe(result => {
        this.tenants = result.items;
        // setTimeout(() => {
        //   $(this.tenantComboboxElement.nativeElement).selectpicker('refresh');
        // })
      })
      this.getCategories();
    }


  }


  getCategories() {
    this.questionTypeId = undefined;
    this._KnowledgeCategoryServiceProxy.getQuestionCategories(this.tenantId, undefined, undefined, 999, 0).subscribe(result => {
      this.questionTypeList = result.items;
    })
  }

  addSolutionType() {
    if (this.questionTypeId) {
      this.createOrEditSolCatModal.questionTypeIdWhenAdd = this.questionTypeId;
    }
    this.createOrEditSolCatModal.show();
  }

  editSolutionType(record) {
    this.createOrEditSolCatModal.show(record);
  }

  deleteSolutionType(record) {
    this.message.confirm(this.l('deletethiscategory'),this.l('AreYouSure'), (r) => {
      if (r) {
        this._KnowledgeCategoryServiceProxy.deleteOptKnowledge(record.id).subscribe(() => {
          this.notify.info(this.l('success'));
          this.getKnowledgeCategories();
        })
      }
    })
  }

  deleteBatch() {
    var ids = this.selectedList.map((item) => {
      return item.id;
    });
    if (ids.length == 0) {
      return this.notify.info(this.l('atLeastChoseOneItem'));
    }
    this.message.confirm(this.l('deletethiscategory'),this.l('AreYouSure'), (r) => {
      if (r) {
        this._KnowledgeCategoryServiceProxy.deleteOptKnowledges(ids).subscribe(() => {
          this.notify.success(this.l('success'));
          this.selectedList = [];
          this.getKnowledgeCategories();
        })
      }
    })
  }

  getKnowledgeCategories(event?: LazyLoadEvent) {
    setTimeout(() => {
      this.selectedList = [];
      this.primengTableHelper.showLoadingIndicator();
      this._KnowledgeCategoryServiceProxy.getOptKnowledges(
        this.tenantId,
        this.questionTypeId,
        this.filterText,
        this.primengTableHelper.getSorting(this.dataTable),
        this.primengTableHelper.getMaxResultCount(this.paginator, event),
        this.primengTableHelper.getSkipCount(this.paginator, event)
      )
    .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
    .subscribe(result => {
        this.primengTableHelper.totalRecordsCount = result.totalCount;
        this.primengTableHelper.records = result.items;
        // this.primengTableHelper.hideLoadingIndicator();
      })
    }, 200)
  }


  //获取分类树
  getCateTree() {
    // abp.ui.setBusy();
    this.treeBusy = true;

    if (this.type == 'category') {
      this._cateService.getCategoryTrees().pipe(finalize(() => {
        // abp.ui.clearBusy();
        this.treeBusy = false;
      })).subscribe((result) => {
        this.categoryList = result;
        if (this.categoryList.length != 0) {
          this.haveCategory = true;
        } else {
          this.haveCategory = false;
        }
        console.log(this.categoryList)
      })
    } else if (this.type == 'questionType') {
      this._KnowledgeCategoryServiceProxy.getCategoryTrees(this.tenantId).pipe(finalize(() => {
        // abp.ui.clearBusy();
        this.treeBusy = false;
      })).subscribe((result) => {
        this.categoryList = result;
        if (this.categoryList.length != 0) {
          this.haveCategory = true;
        } else {
          this.haveCategory = false;
        }
        console.log(this.categoryList)
      })
    } else if (this.type == 'brandCate') {
      this._brandServiceProxy.getBrandCategoryTrees().pipe(finalize(() => {
        // abp.ui.clearBusy();
        this.treeBusy = false;
      })).subscribe((result) => {
        this.categoryList = result;
        if (this.categoryList.length != 0) {
          this.haveCategory = true;
        } else {
          this.haveCategory = false;
        }
        console.log(this.categoryList)
      })
    }

  }


  changeTenant() {
    console.log(this.router)
    this.router.navigate(['app', 'category', 'maintain', 'transfer'], { queryParams: { tenantId: this.tenantId } });
  }

  //添加根分类
  addRootCate() {
    this.createOrEditCateModal.show(null);
  }
  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }

  //拖动排序
  emitDrag(emitData) {
    console.log(emitData);
    // this.createOrEditCateModal.show(Object.assign({}, result), true);
    if (this.type == 'category') {
      this._cateService.getSingleProductCategory(emitData.itemId).subscribe((result) => {
        console.log(result)
        var updateProductCategory = new UpdateProductCategoryInput(result);
        updateProductCategory.parentCategoryId = emitData.parentId;
        this._cateService.updateProductCategory(updateProductCategory)
          .subscribe(() => {
            this.notify.info(this.l('SavedSuccessfully'));
            this.getCateTree();
          });
      })
    } else if (this.type == 'questionType') {
      this._KnowledgeCategoryServiceProxy.getSingleQuestionCategory(emitData.itemId).subscribe((result) => {
        console.log(result)
        var updateQuestionCategoryInput = new UpdateQuestionCategoryInput(result);
        updateQuestionCategoryInput.parentCategoryId = emitData.parentId;
        this._KnowledgeCategoryServiceProxy.updateQuestionCategory(updateQuestionCategoryInput)
          .subscribe(() => {
            this.notify.info(this.l('SavedSuccessfully'));
            this.getCateTree();
          });
      })
    } else if (this.type == 'brandCate') {
      this._brandServiceProxy.getSingleBrandCategory(emitData.itemId).subscribe((result) => {
        console.log(result)
        var updateBrandCategory = new UpdateBrandCategoryInput(result);
        updateBrandCategory.parentCategoryId = emitData.parentId;
        this._brandServiceProxy.updateBrandCategory(updateBrandCategory)
          .subscribe(() => {
            this.notify.info(this.l('SavedSuccessfully'));
            this.getCateTree();
          });
      })
    }
  }

  //分类树操作
  onMenu(result) {
    var action = result.action,
      data = result.data;
    switch (action) {
      case "add":
        this.createOrEditCateModal.show(Object.assign({}, data));
        break;
      case "detail":
        this.createOrEditCateModal.show(Object.assign({}, data), true);
        break;
      case "edit":
        console.log(data)
        this.createOrEditCateModal.show(Object.assign({}, data), true);
        break;
      case "delete":
        var msg = !data.children || data.children.length == 0 ? this.l('deletethiscategory') : this.l('deletethiscategoryandchildren');
        this.message.confirm(msg,this.l('AreYouSure'), (r) => {
          if (r) {
            if (this.type == 'category') {
              this._cateService.deleteProductCategory(data.id).subscribe(() => {
                this.notify.info(this.l('success'));
                this.getCateTree();
              })
            } else if (this.type == 'questionType') {
              this._KnowledgeCategoryServiceProxy.deleteQuestionCategory(data.id).subscribe(() => {
                this.notify.info(this.l('success'));
                this.getCateTree();
              })
            } else if (this.type == 'brandCate') {
              this._brandServiceProxy.deleteBrandCategory(data.id).subscribe(() => {
                this.notify.info(this.l('success'));
                this.getCateTree();
              })
            }
          }
        })
        break;

      case "click":
        console.log(data, 111)
        if (this.type == 'questionType') {
          this.questionTypeId = data;
          this.getKnowledgeCategories();
        }
        break;
    }
  }
}

