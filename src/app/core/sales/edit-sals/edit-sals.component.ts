import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { routes } from 'src/app/shared/routes/routes';
import { SharedModule } from 'src/app/shared/shared.module';
import { CalendarModule } from 'primeng/calendar';
import { TaxesService } from '../../settings/taxes/taxes.service';
import { CustomersdataService } from '../../Customers/customers.service';
import { SalesService } from '../sales.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriesService } from '../../settings/categories/categories.service';
import { ToastModule } from 'primeng/toast';
import { SubCategoriesService } from '../../settings/sub-categories/sub-categories.service';
import { UnitsService } from '../../settings/units/units.service';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-edit-sals',
  standalone: true,
  imports: [CommonModule, SharedModule, DropdownModule, CalendarModule, ToastModule, MultiSelectModule],
  templateUrl: './edit-sals.component.html',
  styleUrl: './edit-sals.component.scss',
  providers: [MessageService]
})
export class EditSalsComponent {

  editSalesForm!: FormGroup;
  public routes = routes;
  salesId = "";
  customerList = [];
  categoryList = []
  subCategoryList = []
  addTaxTotal: any;
  unitListData: []
  orderStatusList = [
    { orderStatus: "Ordered" },
    { orderStatus: "Confirmed" },
    { orderStatus: "Processing" },
    { orderStatus: "Shipping" },
    { orderStatus: "Delivered" },
  ];
  orderTaxList = []
  taxesListData = [];
  public itemDetails: number[] = [0];
  public chargesArray: number[] = [0];
  public recurringInvoice = false;
  public selectedValue!: string;

  constructor(

    private activeRoute: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private Service: SalesService,
    private customerService: CustomersdataService,
    private unitService: UnitsService,
    private CategoriesService: CategoriesService,
    private subCategoriesService: SubCategoriesService,
    private taxService: TaxesService,
    private fb: FormBuilder,
  ) {
    this.editSalesForm = this.fb.group({
      id: [''],
      salesInvoiceNumber: [''],
      customer: [''],
      salesDate: [''],
      salesOrderStatus: [''],
      salesOrderTax: [''],
      salesDiscount: ['', [Validators.min(0)]],
      salesShipping: ['', [Validators.min(0)]],
      salesTermsAndCondition: [''],
      salesNotes: [''],
      salesTotalAmount: [''],
      unit: [''],
      otherCharges: ['', [Validators.min(0)]],
      salesItemDetails: this.fb.array([
        this.fb.group({
          salesItemCategory: [''],
          salesItemSubCategory: [''],
          salesItemName: [''],
          salesItemQuantity: ['', [Validators.min(0)]],
          salesItemUnitPrice: ['', [Validators.min(0)]],
          salesItemSubTotal: ['', [Validators.min(0)]],
        })
      ]),
    });
    this.salesId = this.activeRoute.snapshot.params["id"];
  }

  get salesItemDetails() {
    return this.editSalesForm.controls['salesItemDetails'] as FormArray;
  }
  deletesalesItemDetails(salesItemDetailsIndex: number) {
    this.salesItemDetails.removeAt(salesItemDetailsIndex);
  }
  addsalesItemDetailsItem() {
    const item = this.fb.group({
      salesItemCategory: [''],
      salesItemSubCategory: [''],
      salesItemName: [''],
      salesItemQuantity: [''],
      salesItemUnitPrice: [''],
      salesItemSubTotal: [''],
    });
    this.salesItemDetails.push(item);

  }


  getSalesItemQuantityError(index: number) {
    const salesItemDetailsForm = this.editSalesForm.get('salesItemDetails') as FormArray;
    const quantityControl = salesItemDetailsForm.at(index).get('salesItemQuantity');
    return quantityControl && quantityControl.hasError('min') && quantityControl.touched;
  }

  getSalesItemUnitPriceError(index: number) {
    const salesItemDetailsForm = this.editSalesForm.get('salesItemDetails') as FormArray;
    const unitPriceControl = salesItemDetailsForm.at(index).get('salesItemUnitPrice');
    return unitPriceControl && unitPriceControl.hasError('min') && unitPriceControl.touched;
  }

  getSalesItemSubTotalError(index: number) {
    const salesItemDetailsForm = this.editSalesForm.get('salesItemDetails') as FormArray;
    const subTotalControl = salesItemDetailsForm.at(index).get('salesItemSubTotal');
    return subTotalControl && subTotalControl.hasError('min') && subTotalControl.touched;
  }


  ngOnInit(): void {
    let totalTax = 0;

    this.customerService.GetCustomerData().subscribe((resp: any) => {
      this.customerList = resp;
    });

    this.unitService.getAllUnitList().subscribe((resp: any) => {
      this.unitListData = resp.data;
    })

    this.taxService.getAllTaxList().subscribe((resp: any) => {
      this.taxesListData = resp.data;
      this.orderTaxList = [];
      this.taxesListData.forEach(element => {
        this.orderTaxList.push({
          orderTaxName: element.name + ' (' + element.taxRate + '%' + ')',
          orderNamevalue: element
        });
      });
    });

    this.CategoriesService.getCategories().subscribe((resp: any) => {
      this.categoryList = resp.data;
    });

    this.subCategoriesService.getSubCategories().subscribe((resp: any) => {
      this.subCategoryList = resp.data;
    });

    this.Service.GetSalesDataById(this.salesId).subscribe((resp: any) => {
      resp.data?.salesItemDetails?.forEach(lang => {
        this.addsalesItemDetailsItem()
      });

      // resp.data.appliedTax = resp.data.appliedTax.map(element => {
      //   return {
      //     orderTaxName: element.name + ' (' + element.taxRate + '%' + ')',
      //     orderNamevalue: element
      //   }
      // }),
      resp.data.appliedTax.forEach(element => {
        totalTax += Number(element.orderNamevalue.taxRate);
      });
      this.addTaxTotal = resp.data.salesTotalAmount * totalTax / 100;
        console.log("applied tax", resp.data.appliedTax);


      this.patchForm(resp.data)
    })

    this.calculateTotalAmount()

  }


  calculateTotalAmount() {
    console.log("Enter in caltotal");
    let totalTax = 0;
    let totalAmount = 0;
    if (Array.isArray(this.editSalesForm.get('salesOrderTax').value)) {
      this.editSalesForm.get('salesOrderTax').value.forEach(element => {
        totalTax += Number(element.taxRate);
      });
    } else {
      totalTax += Number(this.editSalesForm.get('salesOrderTax').value);
    }
    let shipping = +this.editSalesForm.get('salesShipping').value;
    let Discount = +this.editSalesForm.get('salesDiscount').value;
    let otherCharges = +this.editSalesForm.get('otherCharges').value;

    const salesItems = this.editSalesForm.get('salesItemDetails') as FormArray;

    salesItems.controls.forEach((item: FormGroup) => {
      const quantity = +item.get('salesItemQuantity').value || 0;
      const unitPrice = +item.get('salesItemUnitPrice').value || 0;
      const subtotal = quantity * unitPrice;

      totalAmount += subtotal;
      item.get('salesItemSubTotal').setValue(subtotal.toFixed(2));
    });
    this.addTaxTotal = totalAmount * totalTax / 100;
    totalAmount += this.addTaxTotal;
    totalAmount -= Discount;
    totalAmount += shipping;
    totalAmount += otherCharges;

    this.editSalesForm.patchValue({
      salesDiscount: Discount.toFixed(2),
      salesShipping: shipping.toFixed(2),
      otherCharges: otherCharges.toFixed(2),
      salesTotalAmount: totalAmount.toFixed(2)
    });
  }

  onCustomerSelect(customerId: string) {
    const selectedCustomer = this.customerList.find(customer => customer._id === customerId);
    this.editSalesForm.get('customer').setValue(selectedCustomer);
  }

  patchForm(data) {
    console.log(data);
    this.editSalesForm.patchValue({
      salesInvoiceNumber: data.salesInvoiceNumber,
      customer: data.customer,
      salesDate: data.salesDate,
      salesOrderStatus: data.salesOrderStatus,
      salesOrderTax: data.appliedTax,
      salesDiscount: data.salesDiscount,
      salesShipping: data.salesShipping,
      salesTermsAndCondition: data.salesTermsAndCondition,
      salesNotes: data.salesNotes,
      salesTotalAmount: data.salesTotalAmount,
      unit: data.unit,
      otherCharges: data.otherCharges,

    });

    this.salesItemDetails.patchValue(data.salesItemDetails);
  }


  editSalesFormSubmit() {
    const formData = this.editSalesForm.value;
    const selectedCustomerId = this.editSalesForm.get('customer').value?._id;
    const selectedCustomerName = this.editSalesForm.get('customer').value?.name;

    let totalTax = 0
    formData.salesOrderTax.forEach(element => {
      totalTax = totalTax + Number(element.taxRate);
    });

    const payload = {
      // customer: formData.customer,
      customer: {
        _id: selectedCustomerId,
        name: selectedCustomerName
      },
      salesDate: formData.salesDate,
      salesDiscount: formData.salesDiscount,
      salesInvoiceNumber: formData.salesInvoiceNumber,
      salesItemDetails: formData.salesItemDetails,
      salesNotes: formData.salesNotes,
      salesOrderStatus: formData.salesOrderStatus,
      salesOrderTax: totalTax,
      salesShipping: formData.salesShipping,
      appliedTax: formData.salesOrderTax.map(i => {
        return {
          _id: i._id,
          name: i.name
        }
      }),
      salesTermsAndCondition: formData.salesTermsAndCondition,
      salesTotalAmount: formData.salesTotalAmount,
      unit: formData.unit,
      otherCharges: formData.otherCharges,
      id: "",
    }






    if (this.editSalesForm.valid) {
      console.log("valid form");
      console.log(payload);
      payload.id = this.salesId
      this.Service.UpdateSalesData(payload).subscribe((resp: any) => {
        console.log(resp);
        if (resp) {
          if (resp.status === "success") {
            const message = "Sales has been updated";
            this.messageService.add({ severity: "success", detail: message });
            setTimeout(() => {
              this.router.navigate(["/sales"]);
            }, 400);
          } else {
            const message = resp.message;
            this.messageService.add({ severity: "error", detail: message });
          }
        }
      });
    }
    else {
      console.log("invalid form");
    }
  }


}
