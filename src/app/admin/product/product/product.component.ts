import { Component, OnInit, Injector, ViewChild, OnDestroy, ElementRef, ChangeDetectorRef, AfterViewChecked, AfterContentChecked } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';

import { ProductServiceProxy, ProductDto, ApplyServiceProxy, CreateApplyFormInput, ApplyWanted as CreateApplyFormInputWanted, ApplyFormType as CreateApplyFormInputApplyType, AuditStatus as AuditStatus3, PublishEntitiesInput, TagServiceProxy, ProductCategoryServiceProxy, SetProductTagsDto, SetProductCategoryDto, IdTypeDto, TagType as Type, PublishSearchedProductInput, GetProductsInput } from '@shared/service-proxies/service-proxies-product';


import { FileServiceProxy } from '@shared/service-proxies/service-proxies'

import { Router, ActivatedRoute } from '@angular/router';
import { ConnectorService } from '@app/shared/services/connector.service';
import { CreateOrEditProModalComponent } from '@app/admin/product/product/create-or-edit-prod-modal.component';
import { MyTreeComponent } from '@app/shared/common/my-tree/my-tree.component';
import { Table, TableCheckbox } from 'primeng/table';
import { finalize } from '@node_modules/rxjs/operators';
import * as moment from 'moment';
import { AppConsts } from '@shared/AppConsts';

import { DeviceServiceProxy as NewDeviceServiceProxy} from '@shared/service-proxies/service-proxies-devicecenter';
import { BrandServiceProxy } from '@shared/service-proxies/service-proxies-devicecenter';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
  animations: [appModuleAnimation()]
})

export class ProductComponent extends AppComponentBase implements OnInit, OnDestroy {

  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;
  @ViewChild('myTree', { static: false }) myTree: MyTreeComponent;
  @ViewChild('brandTree', { static: false }) brandTree: MyTreeComponent;
  @ViewChild('tree', { static: false }) tree: MyTreeComponent;
  @ViewChild('createOrEditProdModal', { static: true }) createOrEditProdModal: CreateOrEditProModalComponent;
  @ViewChild('TableCheckbox', { static: true }) TableCheckbox: TableCheckbox;
  //页面输入域绑定参数
  save;
  product
  close;
  busy = false;
  //查询参数
  language = '';
  region = '';

  StartTime;
  EndTime;
  // StartTime: any = moment().utc().subtract(365, 'days').startOf('day');
  // EndTime: any = moment().utc().endOf('day');
  AuditStatus: any = '';
  TagId: any = "";
  CatetoryId: any = "";
  CatetoryIds = [];
  Price1;
  Price2;
  Stock;
  salesVolume;
  SortStatus;
  filter: any = {};
  IsSearchSku = false;
  filterText: string;
  stockOperator: string = '=';
  salesVolumeOperator: string = '=';
  tagFilter: string = '';
  cateFilter: string = '';
  treeFilter: string = '';
  //search模块的参数
  tenantId;
  status;
  operationType = '';
  productsPublishList: any[] = [];
  //下拉数据 分类以及标签
  showTreeFlag = false;
  get tagIds() {
    return this.tagTree ? this.tagTree.getchosenIds() : [];//null
  }
  get cateIds() {
    return this.cateTree ? this.cateTree.getchosenIds() : null;
  }
  Tags = [];
  tagList = [];
  Categories = [];
  CategoriesTree = [];
  tagConfig = {
    'name': 'value'
  };
  cateConfig = {
    'name': 'name',
  };
  treeConfig: any = {
    'selectable': true,
    'singleSelect': false,
    'showIcon': true,
    'menu': false,
    specialClass: { "productCategory": true }
  }
  @ViewChild('tagTree', { static: false }) tagTree: MyTreeComponent;
  @ViewChild('cateTree', { static: false }) cateTree: MyTreeComponent;
  //枚举
  CreateApplyFormInputWanted = CreateApplyFormInputWanted;
  AuditStatus3 = AuditStatus3;
  //控制显示的标志
  publishType = 'add';
  toPublish: boolean = false;
  productFilter: boolean = false;
  operateAll = false;
  showImage: boolean = false;
  //下发选择树
  deviceTree: any[] = [];
  //审核
  apply: CreateApplyFormInput = new CreateApplyFormInput();

  regionList: any = [];
  languageList: any = [];


  //品牌搜索
  showBrand = false;
  brandList: any = [];
  brandFilter = '';
  BrandText = '';
  chosenItem = [];

  exportLoading = false;

  operateSearch = false;
  getProductsInput: GetProductsInput;


  deviceTypeList: any = [];
  deviceTypeId: any = "";

  // onlyPublishToDevice = false;
  publishTargetType = "";

  informDevice = false;

  constructor(injector: Injector, private _productsService: ProductServiceProxy,
    private router: Router, private route: ActivatedRoute,
    private connector: ConnectorService,
    private _NewDeviceServiceProxy: NewDeviceServiceProxy,
    private tagService: TagServiceProxy,
    private cateService: ProductCategoryServiceProxy,
    private applyService: ApplyServiceProxy,
    private changeDef: ChangeDetectorRef,
    private _FileServiceProxy: FileServiceProxy,
    private _BrandServiceProxy: BrandServiceProxy,
  ) {
    super(injector);
    this.apply.applyType = CreateApplyFormInputApplyType.Product;
    this.apply.itemids = [];
    this.apply.options = 'all';
    this.getDeviceType();
  }
  ngOnInit() {
    if (window.location.search != '') {
      var productQuery = this.connector.getCache('productQuery');
      this.StartTime = productQuery.startTime;
      this.EndTime = productQuery.endTime;
      this.AuditStatus = productQuery.auditStatus;
      this.TagId = productQuery.tagId;
      this.CatetoryId = productQuery.cateoryId;
      this.CatetoryIds = productQuery.cateoryIds;
      this.Price1 = productQuery.price1;
      this.Price2 = productQuery.price2;
      this.SortStatus = productQuery.sortStatus;
      this.IsSearchSku = productQuery.isSearchSku;
      this.filterText = productQuery.filterText;
      this.dataTable.sortField = productQuery.sort ? productQuery.sort.split(' ')[0] : undefined;
      this.dataTable.sortOrder = productQuery.sort ? productQuery.sort.split(' ')[1].indexOf('ASC') > -1 ? 1 : -1 : undefined;
      this.paginator.rows = productQuery.maxResultCount;
      this.paginator.first = productQuery.skipCount;
      this.showImage = productQuery.showImage;
      this.primengTableHelper.defaultRecordsCountPerPage = productQuery.maxResultCount;
      setTimeout(() => {
        this.paginator.updatePaginatorState();
      }, 0);
      this.Stock = productQuery.stock;
      this.stockOperator = productQuery.stockOperator;
      this.salesVolume = productQuery.salesVolume;
      this.salesVolumeOperator = productQuery.salesVolumeOperator;

    }
    $(document).on("click", this.dropDownBind);
    $(document).on("click", this.dropDownBind2);
    this._NewDeviceServiceProxy.getOuStoreDeviceTree([]).subscribe((result) => {
      this.deviceTree = [result];
    })
    this.getTags();
    this.getCates();
    this.getBrand();
  }
  isNull(item) {
    if (item == null) {
      return true
    } else {
      return false
    }
  }
  ngOnDestroy() {
    $(document).off("click", this.dropDownBind);
    $(document).off("click", this.dropDownBind2);
  }


  getDeviceType() {
    this._NewDeviceServiceProxy.getDeviceTypes(
      undefined,
      undefined,
      99,
      0
    ).subscribe(result => {
      this.deviceTypeList = result.items;
    });
  }

  dropDownBind = function (e) {
    var target = e.target;
    if ($(target).closest(".filterButton div.dropdown-menu").length == 0 && !$(target).hasClass("filterIcon")) {
      this.toggleFilter(false);
    }
  }.bind(this);
  dropDownBind2 = function (e) {
    var target = e.target;
    if (!$(target).hasClass("belongToTree")) {
      this.showBrand = false;
      this.updateBrandSelected();
    }
  }.bind(this);
  //显示隐藏高级过滤搜索
  toggleFilter(f?) {
    if (f) {
      $(".filterButton div.dropdown-menu").show();

      // 暂时注释->
      
      // this._productsService.getRegions().subscribe(r => {
      //   this.regionList = r;
      // })
      // this._productsService.getLanguages().subscribe(r => {
      //   this.languageList = r;
      // })
    } else {
      $(".filterButton div.dropdown-menu").hide();
    }

  }

  //获取标签下拉数据
  getTags() {
    this.tagService.getTagsByType(undefined, undefined, 1000, 0, Type.Product).subscribe((result) => {
      this.Tags = result.items;
      this.tagList = Object.assign([], this.Tags);
    });
  }
  filterTags() {
    this.tagList = this.Tags.filter(item => {
      if (item.value) {
        return item.value.indexOf(this.tagFilter) > -1
      } else {
        return false
      }
    })
  }
  //获取品牌
  getBrand() {
    this._BrandServiceProxy.getBrands(
      undefined,
      undefined,
      undefined,
      undefined,
      999,
      0
    ).subscribe(result => {
      this.brandList = result.items;
    });
  }
  //获取分类
  getCates(f?) {
    if (f && this.Categories.length != 0) {
      return;
    }
    //获取分类下拉数据
    this.cateService.getProductCategories(
      this.cateFilter,
      undefined,
      1000,
      0
    ).subscribe((result) => {
      this.Categories = result.items;
    });
    this.cateService.getCategoryTrees().subscribe((result) => {
      this.CategoriesTree = result;
      this.createOrEditProdModal.categoryList = result;
    });
  }
  updateBrandSelected() {
    if (!this.brandTree) return//用于修复bug
    var arr = this.brandTree.getchosen().map(item => {
      return item.name
    })
    this.BrandText = '';
    for (var i = 0; i < arr.length; i++) {
      this.BrandText = this.BrandText + arr[i] + ' '
    }

  }
  //获取商品列表
  getProducts(event?: LazyLoadEvent) {

    if (this.showBrand) {
      this.chosenItem = this.brandTree.getchosen().map(item => {
        return item.id
      })
    }

    if (this.Price2 && (this.Price1 > this.Price2)) {
      return this.notify.warn(this.l('price2LessThenPrice'));
    }
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);
      return;
    }
    this.productsPublishList = [];

    this.primengTableHelper.showLoadingIndicator();

    this.getProductsInput = new GetProductsInput({
      currentProductId: undefined,
      startTime: this.StartTime,
      endTime: this.EndTime,
      auditStatus: this.AuditStatus,
      tagIds: this.TagId ? [this.TagId] : undefined,
      catetoryIds: this.CatetoryIds || undefined,
      price1: this.Price1 || undefined,
      price2: this.Price2 || undefined,
      stock: this.Stock !== undefined && this.Stock !== null ? this.stockOperator + this.Stock : undefined,
      salesVolume: this.salesVolume !== undefined && this.salesVolume !== null ? this.salesVolumeOperator + this.salesVolume : undefined,
      sortStatus: this.SortStatus,
      isSearchSku: this.IsSearchSku,
      organizationId: undefined,
      language: this.language,
      region: this.region,
      brandIds: this.chosenItem,
      pointRedeemType: undefined,
      filter: this.filterText,
      sorting: this.primengTableHelper.getSorting(this.dataTable) || 'lastModificationTime DESC',
      maxResultCount: this.primengTableHelper.getMaxResultCount(this.paginator, undefined),
      skipCount: this.primengTableHelper.getSkipCount(this.paginator, undefined)
    })

    this._productsService.getProducts(
      undefined,
      this.StartTime,
      this.EndTime,
      this.AuditStatus,
      this.TagId ? [this.TagId] : undefined,
      this.CatetoryIds || undefined,
      this.Price1 || undefined,
      this.Price2 || undefined,
      this.Stock !== undefined && this.Stock !== null ? this.stockOperator + this.Stock : undefined,
      this.salesVolume !== undefined && this.salesVolume !== null ? this.salesVolumeOperator + this.salesVolume : undefined,
      this.SortStatus,
      this.IsSearchSku,
      undefined,
      this.language,
      this.region,
      this.chosenItem,
      undefined,
      this.filterText,
      this.primengTableHelper.getSorting(this.dataTable) || 'lastModificationTime DESC',
      this.primengTableHelper.getMaxResultCount(this.paginator, event),
      this.primengTableHelper.getSkipCount(this.paginator, event)
    )
      .pipe(this.myFinalize(() => { this.primengTableHelper.hideLoadingIndicator(); }))
      .subscribe(result => {
        this.showBrand = false;
        this.primengTableHelper.totalRecordsCount = result.totalCount;
        this.primengTableHelper.records = result.items;
        // this.primengTableHelper.hideLoadingIndicator();
        // setTimeout(() => {
        //   this.juggeChosen(this.productsPublishList);
        // },0)
      });

  }
  //删除商品
  deleteProduct(record) {
    this.message.confirm(this.l("DeleteproductsQuestion"), this.l('AreYouSure'), (r) => {
      if (r) {
        this._productsService.deleteProductById(record.id).subscribe(r => {
          this.notify.info(this.l('success'));
          this.getProducts();
        })
      }
    })
  }
  //切换显示模式
  toggle(f) {
    this.showImage = f;
    this.TableCheckbox.tableService.onSelectionChange();
  }
  onOperate(e) {
    if (e.action == 'info') {
      this.productOperation(e.image);
    } else {
      this.deleteProduct(e.image);
    }
  }
  doFilterproducts() {
    this.getProducts();
    this.toggleFilter(false);
  }
  //转换序列
  transIndex(i, event?: LazyLoadEvent) {
    return i + 1 + this.primengTableHelper.getSkipCount(this.paginator, event);
  }
  //新增
  alertCreateModal() {
    this.createOrEditProdModal.show();
  }
  //编辑商品
  productOperation(record) {
    this.connector.setCache('productQuery', {
      'startTime': this.StartTime,
      'endTime': this.EndTime,
      'auditStatus': this.AuditStatus,
      'tagId': this.TagId,
      'cateoryId': this.CatetoryId,
      'cateoryIds': this.CatetoryIds,
      'price1': this.Price1,
      'price2': this.Price2,
      'stock': this.Stock,
      'stockOperator': this.stockOperator,
      'salesVolume': this.salesVolume,
      'salesVolumeOperator': this.salesVolumeOperator,
      'sortStatus': this.SortStatus,
      'isSearchSku': this.IsSearchSku,
      'filterText': this.filterText,
      'sort': this.primengTableHelper.getSorting(this.dataTable),
      'maxResultCount': this.primengTableHelper.getMaxResultCount(this.paginator, null),
      'skipCount': this.primengTableHelper.getSkipCount(this.paginator, null),
      'showImage': this.showImage
    });
    //此处 在跳页之前 在浏览器历史里将当前页面路径替换成带query的
    //这样直接点浏览器返回时  返回到的页面就是下面指定的url
    window.history.pushState('', null, window.location.href + '?useQuery=true');
    this.router.navigate(["operation", record.id], { relativeTo: this.route });
  }
  //筛选商品上下线
  filterProduct() {
    var upNum = [], upNumIds = [], downNum = [], downNumIds = [];
    this.productsPublishList.forEach((v, index, array) => {
      if (v.auditStatus == "Offline") {
        downNum.push(v);
        downNumIds.push(v.id);
      } else {
        upNum.push(v);
        upNumIds.push(v.id);
      }
    })
    return {
      upNum: upNum,
      upNumIds: upNumIds,
      downNum: downNum,
      downNumIds: downNumIds
    }
  }
  //检测选中商品上下线情况
  // f -> bool  代表上下线操作  true表示需要上线  则筛去已上线
  //all ->bool 表示是否操作全部
  checkSelection(f, callback, all?) {
    var upNum = this.filterProduct().upNum, downNum = this.filterProduct().downNum,
      upNumIds = this.filterProduct().upNumIds, downNumIds = this.filterProduct().downNumIds;
    if (all) {
      return callback && callback([]);
    }
    if (f) {
      if (downNum.length == 0) {
        return this.notify.info(this.l('noneOfflineGotten'));
      }
      if (upNum.length != 0) {
        this.message.confirm(this.l("nowChooseTip0") + upNum.length + this.l("nowChooseTip1"), this.l('AreYouSure'), (r) => {
          if (r) {
            this.productsPublishList = downNum;
          }
        })
      }
    } else {
      if (upNum.length == 0) {
        return this.notify.info(this.l('noneOnlineGotten'));
      }
      if (downNum.length != 0) {
        this.message.confirm(this.l("nowChooseTip0") + downNum.length + this.l("nowChooseTip2"), this.l('AreYouSure'), (r) => {
          if (r) {
            this.productsPublishList = upNum;
          }
        })
      }
    }
    callback && callback(f ? downNumIds : upNumIds);
  }
  getOuTree(cb?) {
    //获取组织树
    // this.deviceService.getTreeDevices().subscribe((result) => {
    // this.deviceTree = [result];
    cb && cb();
    // })
  }

  //展开发布商品
  goPublishproducts() {
    this.productFilter = false;
    this.checkSelection(false, (ary) => {
      this.getOuTree(() => {
        this.toPublish = true;
        this.publishType = 'add';
      })
    })
  }
  //取消
  no() {
    $("#review").hide();
  }
  //确定
  ok() {
    this.busy = true;
    this.applyService.createApplyForm(this.apply).pipe(finalize(() => {
      this.busy = false;
      this.productsPublishList = [];
      this.getProducts();
      $("#review").hide();
    })).subscribe((result) => { })
  }
  //确认发布商品
  doPublishproducts() {
    this.checkSelection(false, (ary) => {
      var ouOrDeviceList: IdTypeDto[];
      ouOrDeviceList = this.myTree.getchosen().map((item) => {
        return new IdTypeDto({
          'id': item.id,
          'type': item.type
        });
      });

      if (this.publishTargetType) {
        ouOrDeviceList = ouOrDeviceList.filter(item => {
          return item.type == this.publishTargetType
        })
      }

      if (ouOrDeviceList.length == 0) {
        return this.notify.warn(this.l('noselectouordevice'));
      }

      var input = new PublishEntitiesInput({
        'entityIds': ary,
        'ouOrDeviceOrStoreList': ouOrDeviceList,
        'action': this.publishType,
        'includeSku': true,
        'isCreateDefaultSchedule': false,
        'informDevice': this.informDevice,
        'type':'publish'
      });


      var publishSearchedProductInput = new PublishSearchedProductInput({
        'searchCondition': this.getProductsInput,
        'ouOrDeviceOrStoreList': ouOrDeviceList,
        'action': this.publishType,
        'includeSku': true
      })
      if (this.operateSearch) {
        this.message.confirm(this.publishType == 'delete' ? this.l('isWithdrewChosen') : this.l('isPublishChosen'), this.l('AreYouSure'), (r) => {
          if (r) {
            this.productsPublishList = [];
            this._productsService.publishSearchedProducts(publishSearchedProductInput).subscribe((result) => {
              this.notify.info(this.l('success'));
              this.toPublish = false;
              this.operateAll = false;
              this.operateSearch = false;
            });
          }
        })
      } else if (this.operateAll) {
        this.message.confirm(this.publishType == 'delete' ? this.l('isWithdrewAll') : this.l('isPublishAll'), this.l('AreYouSure'), (r) => {
          if (r) {
            this.productsPublishList = [];
            this._productsService.publishAllToOrganizationOrDevicesOrStore(input).subscribe((result) => {
              this.notify.info(this.l('success'));
              this.toPublish = false;
              this.operateAll = false;
              this.operateSearch = false;
            });
          }
        })
      } else {
        this.message.confirm(this.publishType == 'delete' ? this.l('isWithdrewChosen') : this.l('isPublishChosen'), this.l('AreYouSure'), (r) => {
          if (r) {
            this._productsService.publishToOrganizationOrDevicesOrStore(input).subscribe((result) => {
              this.notify.info(this.l('success'));
              this.productsPublishList = [];
              this.toPublish = false;
              this.operateAll = false;
              this.operateSearch = false;
            });
          }
        })
      }
    }, this.operateAll || this.operateSearch)
  }
  //审核
  review(f, ary?) {
    this.apply.itemids = ary ? ary : [];
    this.apply.reason = '';
    this.apply.wanted = f ? CreateApplyFormInputWanted.Online : CreateApplyFormInputWanted.Offline;
    $("#review").show();
  }

  //下线所有商品
  offlineAll() {
    this.review(false);
  }
  //下线商品
  offline() {
    this.checkSelection(false, (ary) => {
      this.review(false, ary);
    })
  }
  //上线商品
  online() {
    this.checkSelection(true, (ary) => {
      this.review(true, ary);
    })
  }

  //上线所有商品
  onlineAll() {
    this.review(true);
  }
  //批量删除商品
  deleteBatch() {
    this.checkSelection(true, (ary) => {
      this.message.confirm(this.l('batchDeleteProductsQuestion'), this.l('AreYouSure'), (r) => {
        if (r) {
          this._productsService.deleteProductByIds(ary).subscribe((result) => {
            this.notify.info(this.l('success'));
            this.getProducts();
          })
        }
      })
    })
  }
  //发布所有
  publishAll() {
    this.getOuTree(() => {
      this.productFilter = false;
      this.toPublish = true;
      this.publishType = 'add';
      this.operateAll = true;
    })
  }
  //撤回所有
  withdrawAll() {
    this.getOuTree(() => {
      this.productFilter = false;
      this.toPublish = true;
      this.publishType = 'delete';
      this.operateAll = true;
    })
  }

  publishSearch() {
    this.getOuTree(() => {
      this.toPublish = true;
      this.operateSearch = true;
    })
  }

  //前往导入页面
  goImport() {
    this.router.navigate(['app', 'admin','import', 'import', 'product']);
  }


  goExport() {
    this.exportLoading = true;
    // var selectedBrands = this.brandTree.getchosen().map(item => {
    //   return item.id
    // })
    if (this.showBrand) {
      this.chosenItem = this.brandTree.getchosen().map(item => {
        return item.id
      })
    }
    this._productsService.getProductToExcel(
      undefined,
      this.StartTime,
      this.EndTime,
      this.AuditStatus,
      this.TagId ? [this.TagId] : undefined,
      this.CatetoryIds || undefined,
      this.Price1 || undefined,
      this.Price2 || undefined,
      this.Stock !== undefined && this.Stock !== null ? this.stockOperator + this.Stock : undefined,
      this.salesVolume !== undefined && this.salesVolume !== null ? this.salesVolumeOperator + this.salesVolume : undefined,
      this.SortStatus,
      this.IsSearchSku,
      undefined,
      this.language,
      this.region,
      this.chosenItem,
      undefined,
      this.filterText,
      this.primengTableHelper.getSorting(this.dataTable) || 'lastModificationTime DESC',
      undefined,
      0
    ).subscribe(r => {
      setTimeout(() => {
        this.exportLoading = false;
      }, 2000)

      var href = AppConsts.remoteServiceBaseUrl+`/api/File/DownloadTempFile?FileName=` + r.fileName + `&FileType=` + r.fileType + `&FileToken=` + r.fileToken;
      // window.location.href = href;
      var link = document.getElementById('aaa');
      $(link).attr("href", href);
      link.click();
    })
  }

  //判断是否选中商品
  judgeSelection(callback) {
    if (this.productsPublishList.length == 0) {
      return this.notify.info("请选中至少一项商品");
    }
    var ary = [];
    this.productsPublishList.forEach((v, i) => {
      ary.push(v.id);
    })
    callback && callback(ary);
  }
  //选中或者取消选中标签
  setTag() {
    this.judgeSelection((ary) => {
      var ids = this.tagTree.getchosenIds();
      if (ids.length == 0) {
        return this.notify.warn(this.l('atleastonetag'));
      }
      var input = new SetProductTagsDto({
        'tagIds': ids,
        'productIds': ary,
        'action': 'add'
      });
      this._productsService.setOrClearProductTags(input).subscribe((result) => {
        this.notify.info(this.l('success'));
      })
    })
  }
  //选中或者取消选中分类
  setCate() {
    this.judgeSelection((ary) => {
      var ids = this.cateTree.getchosenIds();
      if (ids.length == 0) {
        return this.notify.warn(this.l('atleastonecate'));
      }
      var input = new SetProductCategoryDto({
        'categoryIds': ids,
        'productIds': ary,
        'action': 'add'
      });
      this._productsService.setOrClearProductCategories(input).subscribe((result) => {
        this.notify.info(this.l('success'));
      })
    })
  }
  //清除标签
  clearTag() {
    this.judgeSelection((ary) => {
      var ids = this.tagTree.getchosenIds();
      var input = new SetProductTagsDto({
        'tagIds': ids,
        'productIds': ary,
        'action': 'delete'
      });
      this._productsService.setOrClearProductTags(input).subscribe((result) => {
        this.notify.info(this.l('success'));
        this.getProducts();
      })
    })
  }
  //清除分类
  clearCate() {
    this.judgeSelection((ary) => {
      var ids = this.cateTree.getchosenIds();
      var input = new SetProductCategoryDto({
        'categoryIds': ids,
        'productIds': ary,
        'action': 'delete'
      });
      this._productsService.setOrClearProductCategories(input).subscribe((result) => {
        this.notify.info(this.l('success'));
        this.getProducts();
      })
    })
  }

  //前往管理标签
  goTag(f?) {
    f !== undefined ? this.router.navigate(['app', 'admin','tags', 'tags'], { queryParams: { "type": f } }) : this.router.navigate(['app', 'admin','tags', 'tags']);
  }
  //前往管理分类
  goCate(f?) {
    this.router.navigate(['app', 'admin','category', 'category']);
  }
  //筛选树
  filterTree(e?: Event) {
    e && e.preventDefault();
    this.myTree.filterTree(this.treeFilter, this.deviceTypeId);
  }
  //筛选树
  brandFilterTree(e?: Event) {
    e && e.preventDefault();
    this.brandTree.filterTree(this.brandFilter);
  }
  showTree() {
    this.showTreeFlag = !this.showTreeFlag;
    if (this.CatetoryIds && window.location.search != '' && this.showTreeFlag) {
      setTimeout(() => {
        this.tree.initSelection(this.CatetoryIds);
      })
    }
  }

  getChosen() {
    var chosen = this.tree.getchosen(),
      str = '',
      ids = this.tree.getchosenIds();
    chosen.forEach((item) => {
      str += (str ? " | " : "") + item.text;
    })
    this.CatetoryId = str;
    this.CatetoryIds = ids;
  }
}

