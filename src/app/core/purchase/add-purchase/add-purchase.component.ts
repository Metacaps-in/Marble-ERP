import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { DropdownModule } from "primeng/dropdown";
import { MultiSelectModule } from "primeng/multiselect";
import { routes } from "src/app/shared/routes/routes";
import { SharedModule } from "src/app/shared/shared.module";
import { CalendarModule } from "primeng/calendar";
import { el } from "@fullcalendar/core/internal-common";
import { TaxesService } from "../../settings/taxes/taxes.service";
import { debounceTime } from "rxjs";
import { CustomersdataService } from "../../Customers/customers.service";
import { SuppliersdataService } from "../../Suppliers/suppliers.service";
import { SubCategoriesService } from "../../settings/sub-categories/sub-categories.service";
import { CategoriesService } from "../../settings/categories/categories.service";
import { UnitsService } from "../../settings/units/units.service";
import { ActivatedRoute, Router } from "@angular/router";
import { PurchaseService } from "../purchase.service";
import { MessageService } from "primeng/api";
import { ToastModule } from "primeng/toast";
import { LotService } from "../../Product/lot/lot.service";
import { SlabsService } from "../../Product/slabs/slabs.service";

@Component({
  selector: "app-add-purchase",
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    MultiSelectModule,
    DropdownModule,
    CalendarModule,
    ToastModule,
  ],
  templateUrl: "./add-purchase.component.html",
  styleUrl: "./add-purchase.component.scss",
  providers: [MessageService],
})
export class AddPurchaseComponent implements OnInit {
  addPurchaseForm!: FormGroup;
  getSupplierShow: any;
  public routes = routes;
  subCategoryList: any;
  unitListData: any;
  id: any;
  SupplierLists = [];
  categoryList= [];
  setIT:any
  data:any
  originalData:any
  GridDataForLot?:any = []  
  GridDataForSlab?:any = [] 
  orderStatusList = [
    { orderStatus: "Ordered" },
    { orderStatus: "Confirmed" },
    { orderStatus: "Processing" },
    { orderStatus: "Shipping" },
    { orderStatus: "Delivered" },
  ];
  lotsNoArray = [
    {name:'Lot No.'},
    {name:'Slabs'},
  ]
  orderTaxList = [];
  slabData:any
  lotsNo:any
  slabs:any = null
  taxesListData = [];
  public itemDetails: number[] = [0];
  public chargesArray: number[] = [0];
  public recurringInvoice = false;
  public selectedValue!: string;
  lotValue:any
  nameRegex = /^(?=[^\s])([a-zA-Z\d\/\- ]{3,50})$/;
  notesRegex = /^(?:.{2,100})$/;
  addTaxTotal: any;
  tandCRegex = /^(?:.{2,200})$/;

  constructor(
    private taxService: TaxesService,
    private fb: FormBuilder,
    // private router: Router,
    private Service: SuppliersdataService,
    // private PurchaseService: PurchaseService,
    // private messageService: MessageService,
    private CategoriesService: CategoriesService,
    private subCategoriesService: SubCategoriesService,
    private unitService: UnitsService,
    private Lotservice: LotService,
    private service: SlabsService
  ) {
    this.addPurchaseForm = this.fb.group({
      purchaseInvoiceNumber: ["",
      ],
      purchaseSupplierName: ["", [Validators.required]],
      purchaseDate: ["", [Validators.required]],
      purchaseOrderStatus: ["", [Validators.required]],
      purchaseOrderTax: [""],
      purchaseDiscount: ["", [Validators.min(0)]],
      purchaseShipping: ["", [Validators.min(0)]],
      purchaseTermsAndCondition: ["", [Validators.pattern(this.tandCRegex)]],
      purchaseNotes: ["", [Validators.pattern(this.notesRegex)]],
      purchaseTotalAmount: [""],
      otherCharges: ["", [Validators.min(0)]],
      purchaseGrossTotal: [""],
      oceanFrieght: [''],
      postExpenses:[''],
      quality:[''],
      lotsNo:[null,[Validators.required]],
      lotsType:[''],
      blockNo:[''],
      slabs:[''],
      purchaseItemDetails: this.fb.array([
        this.fb.group({
          purchaseItemCategory: ["", [Validators.required]],
          purchaseItemSubCategory: ["", [Validators.required]],
          unit: ["", [Validators.required]],
          purchaseItemName: [
            "",
            [Validators.required, Validators.pattern(this.nameRegex)],
          ],
          purchaseItemQuantity: ["", [Validators.required, Validators.min(0)]],
          purchaseItemUnitPrice: ["", [Validators.required, Validators.min(0)]],
          purchaseItemSubTotal: ["", [Validators.required, Validators.min(0)]],
        }),
      ]),
    });
  }


  lotType(){
    this.lotValue = this.addPurchaseForm.get('lotsType').value;
  }
  lotValues(LotValue:any){
    this.GridDataForLot = LotValue.blocksDetails;
    console.log(this.GridDataForLot);
    this.GridDataForSlab = []
  }
  slabValues(slabValue:any){
    console.log(slabValue);
    this.GridDataForSlab = slabValue;
    this.GridDataForLot = []
  }
  getSupplier() {
    this.Service.GetSupplierData().subscribe((data: any) => {
      this.getSupplierShow = data;
      this.SupplierLists = [];
      this.getSupplierShow.forEach((element: any) => {
        this.SupplierLists.push({
          name: element.name,
          _id: {
            _id: element._id,
            name: element.name,
          },
        });
      });
    });
  }

  ngOnInit(): void {
    this.getSupplier();
    this.unitService.getAllUnitList().subscribe((resp: any) => {
      this.unitListData = resp.data;
    });
    this.taxService.getAllTaxList().subscribe((resp: any) => {
      this.taxesListData = resp.data;
      this.orderTaxList = [];
      this.taxesListData.forEach((element) => {
        this.orderTaxList.push({
          orderTaxName: element.name + " (" + element.taxRate + "%" + ")",
          orderNamevalue: element,
        });
      });
    });
    this.CategoriesService.getCategories().subscribe((resp: any) => {
      this.categoryList = resp.data;
    });
    this.subCategoriesService.getSubCategories().subscribe((resp: any) => {
      this.subCategoryList = resp.data;
    });
    this.Lotservice.getLotList().subscribe((resp: any) => {
      this.data = resp.data;
      this.originalData = resp.data;
    })
    this.service.getSlabsList().subscribe((resp: any) => {
      this.data = resp.data;
      this.slabData = resp.data;
      console.log("API", this.data);

    })
  }
  calculateTotalAmount() {
    console.log("Enter in caltotal");
    let totalAmount = 0;
    let purchaseGrossTotal = 0;
    let totalTax = 0;

    const purchaseItems = this.addPurchaseForm.get(
      "purchaseItemDetails"
    ) as FormArray;

    purchaseItems.controls.forEach((item: FormGroup) => {
      const quantity = +item.get("purchaseItemQuantity").value || 0;
      const unitPrice = +item.get("purchaseItemUnitPrice").value || 0;
      const subtotal = quantity * unitPrice;
      purchaseGrossTotal += subtotal;
      item.get("purchaseItemSubTotal").setValue(subtotal.toFixed(2));
    });

    if (Array.isArray(this.addPurchaseForm.get("purchaseOrderTax").value)) {
      this.addPurchaseForm.get("purchaseOrderTax").value.forEach((element) => {
        totalTax += Number(element.taxRate);
      });
    } else {
      totalTax += Number(this.addPurchaseForm.get("purchaseOrderTax").value);
    }

    this.addTaxTotal = (purchaseGrossTotal * totalTax) / 100;

    let shipping = +this.addPurchaseForm.get("purchaseShipping").value;
    let Discount = +this.addPurchaseForm.get("purchaseDiscount").value;
    let otherCharges = +this.addPurchaseForm.get("otherCharges").value;
    let oceanFrieght = +this.addPurchaseForm.get("oceanFrieght").value;
    let postExpenses = +this.addPurchaseForm.get("postExpenses").value;


    totalAmount += purchaseGrossTotal;
    totalAmount += this.addTaxTotal;
    totalAmount -= Discount;
    totalAmount += shipping;
    totalAmount += otherCharges;
    totalAmount += oceanFrieght;
    totalAmount += postExpenses;


    this.addPurchaseForm.patchValue({
      purchaseGrossTotal: purchaseGrossTotal.toFixed(),
      purchaseDiscount: Discount.toFixed(),
      purchaseShipping: shipping.toFixed(),
      purchaseTotalAmount: totalAmount.toFixed(),
      otherCharges: otherCharges.toFixed(),
      oceanFrieght: oceanFrieght.toFixed(),
      postExpenses: postExpenses.toFixed(),
    });
  }


  addPurchaseFormSubmit() {
    const formData = this.addPurchaseForm.value;
    console.log(formData);
    let totalTax = 0;
    if(formData.purchaseOrderTax){
      formData.purchaseOrderTax.forEach((e) => {
        totalTax = totalTax + e.taxRate;
      });
    }
      const payload = {
        supplier: formData.purchaseSupplierName,
        purchaseDate: formData.purchaseDate,
        purchaseDiscount: formData.purchaseDiscount,
        purchaseInvoiceNumber: formData.purchaseInvoiceNumber,
        purchaseGrossTotal: formData.purchaseGrossTotal,
        purchaseItemDetails: formData.purchaseItemDetails,
        appliedTax: formData.purchaseOrderTax,
        purchaseNotes: formData.purchaseNotes,
        purchaseOtherCharges: formData.otherCharges,
        // purchaseOtherCharges: formData.quality,
        // purchaseOtherCharges: formData.lotsNo,
        // purchaseOtherCharges: formData.oceanFrieght,
        // purchaseOtherCharges: formData.postExpenses,
        // purchaseOrderStatus: formData.purchaseOrderStatus,
        purchaseOrderTax: formData.purchaseOrderTax,
        purchaseShipping: formData.purchaseShipping,
        purchaseTermsAndCondition: formData.purchaseTermsAndCondition,
        purchaseTotalAmount: formData.purchaseTotalAmount,
      };  

      if (this.addPurchaseForm.valid) {
        console.log("valid form");

      // this.PurchaseService.AddPurchaseData(payload).subscribe((resp: any) => {
      //   console.log(resp);
      //   if (resp) {
      //     if (resp.status === "success") {
      //       const message = "Purchase has been added";
      //       this.messageService.add({ severity: "success", detail: message });
      //       setTimeout(() => {
      //         this.router.navigate(["/purchase"]);
      //       }, 400);
      //     } else {
      //       const message = resp.message;
      //       this.messageService.add({ severity: "error", detail: message });
      //     }
      //   }
      // });
    } else {
    }
  }
}
