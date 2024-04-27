import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { routes } from 'src/app/shared/routes/routes';
import { SharedModule } from 'src/app/shared/shared.module';
import { CalendarModule } from 'primeng/calendar';
import { TaxesService } from '../../settings/taxes/taxes.service';
import { CustomersdataService } from '../../Customers/customers.service';
import { SalesService } from '../sales.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { CategoriesService } from '../../settings/categories/categories.service';
import { ToastModule } from 'primeng/toast';
import { SubCategoriesService } from '../../settings/sub-categories/sub-categories.service';
@Component({
  selector: 'app-addsales',
  standalone: true,
  imports: [CommonModule, SharedModule, MultiSelectModule, DropdownModule, CalendarModule, ToastModule],
  templateUrl: './addsales.component.html',
  styleUrl: './addsales.component.scss',
  providers: [MessageService]
})
export class AddsalesComponent {

  addSalesForm!: FormGroup;
  public routes = routes;
  public searchData_id = '';
  isDisabled: boolean = true;
  customerList = [];
  categoryList = [];
  subCategoryList = [];
  orderStatusList = [
    { orderStatus: "Ordered" },
    { orderStatus: "Confirmed" },
    { orderStatus: "Processing" },
    { orderStatus: "Shipping" },
    { orderStatus: "Delivered" },
  ];
  orderTaxList = []
  taxesListData = [];
  customerById = {};
  public itemDetails: number[] = [0];

  constructor(
    private customerByIdService: CustomersdataService,
    private router: Router,
    private messageService: MessageService,
    private Service: SalesService,
    private customerService: CustomersdataService,
    private CategoriesService: CategoriesService,
    private subCategoriesService: SubCategoriesService,
    private taxService: TaxesService,
    private fb: FormBuilder,
  ) {
    this.addSalesForm = this.fb.group({
      customer: [''],
      salesDate: [''],
      salesDiscount: [''],
      salesInvoiceNumber: [''],
      salesItemDetails: this.fb.array([
        this.fb.group({
          salesItemCategory: [''],
          salesItemSubCategory: [''],
          salesItemName: [''],
          salesItemQuantity: [''],
          salesItemUnitPrice: [''],
          salesItemSubTotal: [''],
        })
      ]),
      salesNotes: [''],
      salesOrderStatus: [''],
      salesOrderTax: [''],
      salesShipping: [''],
      salesTermsAndCondition: [''],
      salesTotalAmount: [''],
    });
  }

  get salesItemDetails() {
    return this.addSalesForm.controls['salesItemDetails'] as FormArray;
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

  ngOnInit(): void {
    this.customerService.GetCustomerData().subscribe((resp: any) => {
      this.customerList = resp;
      console.log("customer", this.customerList);
    });


    this.taxService.getAllTaxList().subscribe((resp: any) => {
      this.taxesListData = resp.data;
      this.orderTaxList = [];
      for (const obj of this.taxesListData) {
        this.orderTaxList.push({
          _id: obj._id,
          taxRate: obj.taxRate,
          orderTaxName: obj.name + ' (' + obj.taxRate + '%' + ')',
        });
      }
    });

    this.CategoriesService.getCategories().subscribe((resp: any) => {
      this.categoryList = resp.data;
    });

    this.subCategoriesService.getSubCategories().subscribe((resp: any) => {
      this.subCategoryList = resp.data;
    });


  }


  calculateTotalAmount() {
    console.log("Enter in caltotal");
    let totalAmount = 0;
    let shipping = +this.addSalesForm.get('salesShipping').value;
    let Discount = +this.addSalesForm.get('salesDiscount').value;
    let orderTax = +this.addSalesForm.get('salesOrderTax').value;
    console.log(orderTax);

    const salesItems = this.addSalesForm.get('salesItemDetails') as FormArray;

    salesItems.controls.forEach((item: FormGroup) => {
      const quantity = +item.get('salesItemQuantity').value || 0;
      const unitPrice = +item.get('salesItemUnitPrice').value || 0;
      const subtotal = quantity * unitPrice;

      totalAmount += subtotal;
      item.get('salesItemSubTotal').setValue(subtotal.toFixed(2));
    });

    let addTaxTotal = totalAmount * orderTax / 100;
    totalAmount += addTaxTotal;
    totalAmount += shipping - Discount;

    this.addSalesForm.patchValue({
      salesDiscount: Discount.toFixed(2),
      salesShipping: shipping.toFixed(2),
      salesTotalAmount: totalAmount.toFixed(2)
    });
  }

  getCustomerById(value:any){
    console.log("value",value);
    
    this.customerByIdService.GetCustomerDataById(value).subscribe((resp: any) => {
      this.customerByIdService = resp
    })

  }



  addSalesFormSubmit() {
    const formData = this.addSalesForm.value;


    const payload = {
      customer: formData.customer,
      salesDate: formData.salesDate,
      salesDiscount: formData.salesDiscount,
      salesInvoiceNumber: formData.salesInvoiceNumber,
      salesItemDetails: formData.salesItemDetails,
      salesNotes: formData.salesNotes,
      salesOrderStatus: formData.salesOrderStatus,
      salesOrderTax: formData.salesOrderTax,
      salesShipping: formData.salesShipping,
      // appliedTax : [
      //   {_id : "kdhh", name : "GST"},
      //   {_id : "kdhh", name : "SGST"}
      //   ],
      salesTermsAndCondition: formData.salesTermsAndCondition,
      salesTotalAmount: formData.salesTotalAmount,
    }


    if (this.addSalesForm.valid) {
      console.log("valid form");
      console.log("data by payload", payload);

      this.Service.AddSalesData(payload).subscribe((resp: any) => {
        console.log(resp);
        if (resp) {
          if (resp.status === "success") {
            const message = "Sales has been added";
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
