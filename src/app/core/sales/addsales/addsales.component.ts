import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { routes } from "src/app/shared/routes/routes";
import { SharedModule } from "src/app/shared/shared.module";
import { TaxesService } from "../../settings/taxes/taxes.service";
import { CustomersdataService } from "../../Customers/customers.service";
import { SalesService } from "../sales.service";
import { MessageService } from "primeng/api";
import { Router } from "@angular/router";
import { LocalStorageService } from "src/app/shared/data/local-storage.service";
import { WarehouseService } from "../../settings/warehouse/warehouse.service";
import { SlabsService } from "../../Product/slabs/slabs.service";
import { BillingAddressService } from "../../settings/billing-Address/billingAddress.service";
import { validationRegex } from "../../validation";

@Component({
  selector: "app-addsales",
  standalone: true,
  imports: [SharedModule],
  templateUrl: "./addsales.component.html",
  styleUrls: ["./addsales.component.scss"],
})
export class AddsalesComponent implements OnInit {
  addSalesForm!: FormGroup;
  public routes = routes;
  maxDate = new Date();
  public searchData_id = "";
  addTaxTotal: any;
  customerList: any = [];
  originalCustomerData = [];
  slabList = [];
  slabData = [];
  addressVisible: any = false;
  orderTaxList = [];
  taxesListData = [];
  public itemDetails: number[] = [0];
  maxQuantity: number;
  invoiceRegex = /^(?=[^\s])([a-zA-Z\d\/\-_ ]{1,30})$/;
  notesRegex = /^(?:.{2,100})$/;
  tandCRegex = /^(?:.{2,200})$/;
  customer: any = ([] = []);
  returnUrl: string;
  wareHousedataListsEditArray: any[];
  originalSlabData: any;
  slabDatas: any;
  slabDataList: any = [];
  address: any;
  orgAddress: any;
  dropAddress: any[];
  billingAddress: any = null;
  setAddressData: any;
  customerAddress: any;
  appliedTaxAmount: number;
  salesGrossTotal: number;
  salesOrderTax: number;
  totalTaxableAmount: number = 0;
  constructor(
    private router: Router,
    private messageService: MessageService,
    private salesService: SalesService,
    private customerService: CustomersdataService,
    private slabService: SlabsService,
    private taxService: TaxesService,
    private fb: FormBuilder,
    private SlabsService: SlabsService,
    private localStorageService: LocalStorageService,
    private services: WarehouseService,
    private BillingAddressService: BillingAddressService
  ) {
    this.addSalesForm = this.fb.group({
      customer: ["", [Validators.required]],
      salesDate: ["", [Validators.required]],
      billingAddress: [""],
      salesDiscount: ["", [ Validators.min(0)]],
      salesInvoiceNumber: ["", [Validators.pattern(this.invoiceRegex)]],
      salesItemDetails: this.fb.array([
        this.fb.group({
          salesItemProduct: ["", [Validators.required]],
          salesItemQuantity: [
            "",
            [
              Validators.required,
              Validators.min(0),
              Validators.max(this.maxQuantity),
            ],
          ],
          salesItemUnitPrice: ["", [Validators.required, Validators.min(0), Validators.max(100000)]],
          salesItemTax: [""],
          salesItemTotal: [""],
          salesItemTaxAmount: [""],
          salesItemSubTotal: ["", [Validators.required, Validators.min(0)]],
          maxQuantity: [" "],
          salesWarehouseDetails: ["", [Validators.required]],
          salesItemNonTaxableAmount: ["", Validators.min(0)],
          salesItemTaxableAmount: ["", Validators.min(0)],
          salesItemAppliedTaxAmount: ["", Validators.min(0)],
          salesItemPieces: ["", [Validators.required, Validators.min(0), Validators.max(100000)]],
          sqftPerPiece: ['']
        }),
      ]),
      salesNotes: ["", [Validators.pattern(this.notesRegex)]],
      salesGrossTotal: [""],
      salesOrderStatus: ["Confirmed"],
      salesOrderTax: [""],
      vendorTaxApplied: ["", [Validators.max(100),Validators.min(0)]],
      vendorTaxAmount: [""],
      appliedTax: [""],
      salesShipping: ["", [Validators.pattern(validationRegex.oneToOneLakhRegex)]],
      salesTermsAndCondition: ["", [Validators.pattern(this.tandCRegex)]],
      salesTotalAmount: ["", [Validators.min(0)]],
      otherCharges: ["", [Validators.pattern(validationRegex.oneToOneLakhRegex)]],
      taxable: [""],
      nonTaxable: [""],
      creditPeriod: ["", [Validators.min(0), Validators.max(180)]],
    });

    // Set up a value change subscription to update the max validator for salesDiscount
    this.addSalesForm.get('salesGrossTotal').valueChanges.subscribe(value => {
      const salesDiscountControl = this.addSalesForm.get('salesDiscount');
      salesDiscountControl.setValidators([
        Validators.min(0),
        Validators.max(value || 0)
      ]);
      salesDiscountControl.updateValueAndValidity();
    });
  }

  get salesItemDetails() {
    return this.addSalesForm.controls["salesItemDetails"] as FormArray;
  }

  deletesalesItemDetails(salesItemDetailsIndex: number) {
    this.salesItemDetails.removeAt(salesItemDetailsIndex);

    if (
      salesItemDetailsIndex > -1 &&
      salesItemDetailsIndex < this.slabDataList.length
    ) {
      this.slabDataList.splice(salesItemDetailsIndex, 1);
    } else {
      console.log("salesItemDetailsIndex out of range");
    }
    this.calculateTotalAmount();
  }

  addsalesItemDetailsItem() {
    const item = this.fb.group({
      salesItemProduct: ["", [Validators.required]],
      salesItemQuantity: [
        "",
        [
          Validators.required,
          Validators.min(0),
          Validators.max(this.maxQuantity),
        ],
      ],
      salesItemUnitPrice: ["", [Validators.required, Validators.min(0), Validators.max(100000)]],
      salesItemTax: [""],
      salesItemTotal: [""],
      salesItemTaxAmount: [""],
      salesItemSubTotal: ["", [Validators.required, Validators.min(0)]],
      maxQuantity: [" "],
      salesWarehouseDetails: ["", [Validators.required]],
      salesItemNonTaxableAmount: ["", Validators.min(0)],
      salesItemTaxableAmount: ["", Validators.min(0)],
      salesItemAppliedTaxAmount: ["", Validators.min(0)],
      salesItemPieces: ["", [Validators.required, Validators.min(0), Validators.max(100000)]],
      sqftPerPiece: ['']

    });
    this.salesItemDetails.push(item);
  }
  onWareHouseSelect(value: any, i: number) {
    this.SlabsService.getSlabListByWarehouseId(value._id).subscribe(
      (resp: any) => {
        this.originalSlabData = resp.data;
        this.slabDatas = resp.data.map((element) => ({
          name: element.slabName,
          _id: {
            _id: element._id,
            slabName: element.slabName,
            slabNo: element.slabNo,
          },
        }));
        this.salesItemDetails.controls.forEach((element, index) => {
          if (i === index) {
            this.slabDataList[index] = this.slabDatas;
            const control = this.salesItemDetails.at(i);
            control.get("salesItemProduct").reset();
            control.get("salesItemQuantity").reset();
            control.get("salesItemUnitPrice").reset();
            control.get("salesItemTax").reset();
            this.calculateTotalAmount();
          } else if (!this.slabDataList[index]) {
            this.slabDataList[index] = [];
          }
        });
      }
    );
  }
  editAddressWithDrop() {
    this.setAddressData = this.addSalesForm.get("billingAddress")?.value;
  }

  ngOnInit() {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US"); // Format to MM/DD/YYYY

    this.addSalesForm.patchValue({
      salesDate: formattedDate,
    });
    this.salesService.getVendorBillingList().subscribe((resp: any) => {
      this.address = resp.data;
      this.orgAddress = resp.data;
      this.dropAddress = [];
      this.orgAddress.forEach((ele) => {
        this.dropAddress.push({
          name: `${ele.companyName} / ${ele.city},`,
          _id: ele,
        });
      });
      const filterData = this.address.find((e) => e.setAsDefault);
      if (!filterData) {
        const message = "First you want to set one billing Address as Default";
        this.messageService.add({ severity: "error", detail: message });
      }
      this.addSalesForm.get("billingAddress").patchValue(filterData);
    });

    this.customerList = this.getCustomer();
    this.customer = this.localStorageService.getItem("customer");
    this.returnUrl = this.localStorageService.getItem("returnUrl");
    if (this.customer) {
      this.addSalesForm.patchValue({
        customer: this.customer,
      });
      this.customerAddress = this.customer.billingAddress;
    }

    this.services.getAllWarehouseList().subscribe((resp: any) => {
      this.wareHousedataListsEditArray = [];
      resp.data.forEach((element: any) => {
        this.wareHousedataListsEditArray.push({
          name: element.name,
          _id: {
            _id: element._id,
            name: element.name,
          },
        });
      });
    });

    this.taxService.getAllTaxList().subscribe((resp: any) => {
      this.taxesListData = resp.data;
      this.orderTaxList = this.taxesListData.map((element) => ({
        orderTaxName: `${element.name} (${element.taxRate}%)`,
        orderNamevalue: element,
      }));
    });

    this.slabService.getSlabsList().subscribe((resp: any) => {
      this.slabData = resp.data;
      this.slabList = this.slabData.map((e) => ({
        slabName: e.slabName,
        _id: {
          _id: e._id,
          slabName: e.slabName,
          slabNo: e.slabNo,
        },
      }));
    });
  }
  editAddress() {
    this.addressVisible = true;
  }

  setCustomer() {
    const data = this.addSalesForm.get("customer").value;
    this.customerAddress = data.billingAddress;
  }
  getCustomer() {
    this.customerService.GetCustomerData().subscribe((resp: any) => {
      this.originalCustomerData = resp;

      this.customerList = this.originalCustomerData.map((element) => ({
        name: element.name,
        _id: {
          _id: element._id,
          name: element.name,
          billingAddress: element.billingAddress,
        },
      }));
    });
  }
  onSlabSelect(value, i) {
    const salesItemDetailsArray = this.addSalesForm.get(
      "salesItemDetails"
    ) as FormArray;

    const selectedSlab = this.slabData.find((slab) => slab._id === value._id);

    if (selectedSlab) {
      let remainingQuantity = selectedSlab.totalSQFT;
      for (let j = 0; j < salesItemDetailsArray.length; j++) {
        if (j !== i) {
          const currentRowSlab = salesItemDetailsArray
            .at(j)
            ?.get("salesItemProduct").value;
          if (currentRowSlab && currentRowSlab._id === value._id) {
            remainingQuantity -=
              salesItemDetailsArray.at(j)?.get("salesItemQuantity").value || 0;
          }
        }
      }

      const salesItemUnitPriceControl = salesItemDetailsArray.at(i)?.get("salesItemUnitPrice");
      const maxQuantityControl = salesItemDetailsArray.at(i)?.get("maxQuantity");
      const sqftPerPieceControl = salesItemDetailsArray.at(i)?.get("sqftPerPiece");

      if (salesItemUnitPriceControl) {
        salesItemUnitPriceControl.patchValue(selectedSlab.sellingPricePerSQFT);
        this.calculateTotalAmount();
      }
      if (maxQuantityControl) {
        maxQuantityControl.setValue(remainingQuantity > 0 ? remainingQuantity : 0);
      }
      if (sqftPerPieceControl) {
        sqftPerPieceControl.patchValue(selectedSlab.sqftPerPiece);
        this.calculateTotalAmount();
      }
    } else {
      console.error("Slab not found!");
    }
  }
  calculateTotalAmount() {
    let salesGrossTotal = 0;
    let salesOrderTax: number = 0;
    let taxable: number = 0;
    let nonTaxable: number = 0;
    const salesItems = this.addSalesForm.get("salesItemDetails") as FormArray;

    this.totalTaxableAmount = 0;
    salesItems.controls.forEach((item) => {
      const quantity = +item.get("salesItemQuantity").value || 0;
      const unitPrice = +item.get("salesItemUnitPrice").value || 0;
      const tax = item.get("salesItemTax").value || [];
      const sqftPerPiece = +item.get("sqftPerPiece").value || 0;
      const discount = +this.addSalesForm.get("salesDiscount").value;
      let salesItemNonTaxableAmount: number = 0;;
      let salesItemTaxableAmount: number = 0;
      
      const pieces = quantity / sqftPerPiece;
      let totalTaxAmount = 0;
      salesItemTaxableAmount = item.get("salesItemTaxableAmount").value;
      this.totalTaxableAmount += Number(salesItemTaxableAmount);
      if (Array.isArray(tax)) {
        tax.forEach((selectedTax: any) => {
          totalTaxAmount +=
            (salesItemTaxableAmount * selectedTax.taxRate) / 100;
        });
      } else {
        totalTaxAmount = (salesItemTaxableAmount * tax) / 100;
      }
      const totalAmount = quantity * unitPrice;
      
      console.log(salesItemNonTaxableAmount);
      salesItemNonTaxableAmount = totalAmount - salesItemTaxableAmount;
      console.log(salesItemNonTaxableAmount);
      const salesItemAppliedTaxAmount = salesItemTaxableAmount + totalTaxAmount;
      taxable += salesItemAppliedTaxAmount;
      let subtotal = quantity * unitPrice + totalTaxAmount;
      // if (discount) {
      //   if (discount <= salesItemNonTaxableAmount) {
      //     // If discount is less than or equal to salesItemNonTaxableAmount
      //     console.log(salesItemNonTaxableAmount);
      //     salesItemNonTaxableAmount = item.get("salesItemNonTaxableAmount").value - discount;
      //     item.get("salesItemNonTaxableAmount").setValue(salesItemNonTaxableAmount);
      //   } else if (discount > salesItemNonTaxableAmount && discount <= item.get("salesItemTaxableAmount").value) {
      //     console.log(item.get("salesItemTaxableAmount").value, discount);
      //     salesItemTaxableAmount = item.get("salesItemTaxableAmount").value - discount;
      //     item.get("salesItemTaxableAmount").setValue(salesItemTaxableAmount);
      //   }
      //   subtotal = subtotal - discount;
      // }
      
      salesOrderTax += totalTaxAmount;
      salesGrossTotal += subtotal;
      if (totalAmount > 0) {
        // const salesItemTaxableAmount = item.get("salesItemTaxableAmount") as FormControl
        item.get("salesItemTaxableAmount").clearValidators();
        item.get("salesItemTaxableAmount").setValidators([Validators.max(totalAmount)]);
        item.get("salesItemTaxableAmount").updateValueAndValidity();

        item.get("salesItemNonTaxableAmount").clearValidators();
        item.get("salesItemNonTaxableAmount").setValidators([Validators.max(totalAmount)]);
        item.get("salesItemNonTaxableAmount").updateValueAndValidity();
      }
      item.get("salesItemPieces").setValue(Number(pieces.toFixed(2)));
      item.get("salesItemTotal").setValue(Number(totalAmount));
      item.get("salesItemTaxAmount").setValue(Number(totalTaxAmount));
      item.get("salesItemAppliedTaxAmount").setValue(Number(salesItemAppliedTaxAmount));
      item.get("salesItemNonTaxableAmount").setValue(Number(salesItemNonTaxableAmount));
      item.get("salesItemSubTotal").setValue(Number(subtotal));
    });

    this.addSalesForm.get("salesOrderTax").setValue(Number(salesOrderTax));
    this.addSalesForm.get("salesGrossTotal").setValue(Number(salesGrossTotal));

    let itemTotalAmount = salesGrossTotal;
    const discount = +this.addSalesForm.get("salesDiscount").value;
    const shipping = +this.addSalesForm.get("salesShipping").value;
    const otherCharges = +this.addSalesForm.get("otherCharges").value;

    itemTotalAmount -= discount;
    itemTotalAmount += shipping;
    itemTotalAmount += otherCharges;
    nonTaxable = itemTotalAmount - taxable;
    this.addSalesForm.get("salesTotalAmount").setValue(Number(itemTotalAmount));
    this.addSalesForm.get("taxable").setValue(Number(taxable));
    this.addSalesForm.get("nonTaxable").setValue(Number(nonTaxable));
    if (this.setAddressData?.isTaxVendor) {
      this.taxVendorAmount();
    }
  }
  taxVendorAmount() {
    const vendorTaxApplied = this.addSalesForm.get("vendorTaxApplied").value;

    if (vendorTaxApplied) {
      const vendorTaxAmount = (this.totalTaxableAmount * vendorTaxApplied) / 100;
      this.addSalesForm
        .get("vendorTaxAmount")
        .setValue(Number(vendorTaxAmount));
    }
  }

  navigateToCreateCustomer() {
    const returnUrl = this.router.url;
    this.localStorageService.setItem("returnUrl", returnUrl);
    this.router.navigateByUrl("/customers/add-customers");
  }

  addSalesFormSubmit() {
    const formData = this.addSalesForm.value;
    const payload = {
      customer: formData.customer,
      salesDate: formData.salesDate,
      billingAddress: formData.billingAddress,
      salesDiscount: Number(formData.salesDiscount),
      salesInvoiceNumber: formData.salesInvoiceNumber,
      salesItemDetails: formData.salesItemDetails,
      salesNotes: formData.salesNotes,
      salesGrossTotal: Number(formData.salesGrossTotal),
      salesShipping: Number(formData.salesShipping),
      salesTermsAndCondition: formData.salesTermsAndCondition,
      salesTotalAmount: Number(formData.salesTotalAmount),
      otherCharges: Number(formData.otherCharges),
      taxVendor: this.setAddressData?.isTaxVendor
        ? {
          _id: this.setAddressData._id,
          companyName: this.setAddressData.companyName,
          taxVendorAmount: Number(formData.vendorTaxAmount),
          vendorTaxApplied: Number(formData.vendorTaxApplied),
        }
        : null,
      salesOrderTax: Number(formData.salesOrderTax),
      taxable: Number(formData.taxable),
      nonTaxable: Number(formData.nonTaxable),
      creditPeriod: Number(formData.creditPeriod),
    };

    if (this.addSalesForm.valid) {
      this.salesService.AddSalesData(payload).subscribe((resp: any) => {
        if (resp) {
          if (resp.status === "success") {
            const message = "Sales has been added";
            this.messageService.add({ severity: "success", detail: message });
            setTimeout(() => {
              if (this.returnUrl == "/sales/add-sales") {
                this.router.navigate(["/sales"]);
              } else {
                this.router.navigateByUrl(this.returnUrl);
              }
            }, 400);
          } else {
            const message = resp.message;
            this.messageService.add({ severity: "error", detail: message });
          }
        }
      });
    } else {
      console.log("Invalid form");
    }
  }
}
