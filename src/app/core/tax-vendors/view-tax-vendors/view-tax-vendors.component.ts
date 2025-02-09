import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { MessageService } from "primeng/api";
import { routes } from "src/app/shared/routes/routes";
import { SharedModule } from "src/app/shared/shared.module";
import { BillingAddressService } from "../../settings/billing-Address/billingAddress.service";
import { TaxVendorsService } from "../tax-vendors.service";


@Component({
  selector: "app-view-tax-vendors",
  standalone: true,
  imports: [SharedModule],
  templateUrl: "./view-tax-vendors.component.html",
  styleUrls: ["./view-tax-vendors.component.scss"], // Fix: 'styleUrl' should be 'styleUrls'
})
export class ViewTaxVendorsComponent implements OnInit {
  public routes = routes;
  id: any;
  taxVendorsData: any = {};
  vendorsSalesData: any = {};
  vendorsPaymentData: any = {};
  showDialog = false;
  modalData: any;
  salesDataShowById: any[] = [];
  purchaseDataShowById: any[] = [];
  purchaseDataShowBy: string = "purchaseDataShowBy";
  salesDataShowBy: string = "salesDataShowBy";
  paymentListDataByTaxVendorsId: any[] = [];
  purchasePaymentListDataByTaxVendorsId: any[] = [];
  selectedSales: any[] = []; // Holds the selected sales items
  selectedPurchase: any[] = []; // Holds the selected Purchase items
  addTaxVendorsPaymentForm!: FormGroup;
  displayPaymentDialog: boolean = false;
  paymentModeList = [
    {
      paymentMode: "Cash",
    },
    {
      paymentMode: "Bank",
    },
    {
      paymentMode: "Online",
    },
  ];
  maxDate = new Date();
  totalSelectedSalesTotalAmount: number = 0; // Declare this variable
  totalSelectedSalesDueAmount: number = 0; // Declare this variable
  totalSelectedSalesPayableAmount: number = 0; // Declare this variable
  totalSelectedPurchaseTotalAmount: number = 0; // Declare this variable
  totalSelectedPurchaseDueAmount: number = 0; // Declare this variable
  totalSelectedPurchasePayableAmount: number = 0; // Declare this variable
  salesPaymentId: any;
  purchasePaymentId: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private BillingAddressService: BillingAddressService,
    private activeRoute: ActivatedRoute,
    private TaxVendorsService: TaxVendorsService
  ) {
    this.addTaxVendorsPaymentForm = this.fb.group({
      sales: this.fb.array([]),
      paymentDate: ["", [Validators.required]],
      paymentMode: ["", [Validators.required]],
      purchase: this.fb.array([]),
      note: [""],
      payableAmount: [
        "",
        [
          Validators.required,
          // Validators.min(this.totalSelectedSalesDueAmount),
          // Validators.max(this.totalSelectedSalesDueAmount)
        ],
      ],
    });
    this.id = this.activeRoute.snapshot.params["id"];
  }

  get sales(): FormArray {
    return this.addTaxVendorsPaymentForm.get("sales") as FormArray;
  }
  get purchase(): FormArray {
    return this.addTaxVendorsPaymentForm.get("purchase") as FormArray;
  }

  addSalesControls(unpaidSales: any[]) {
    this.sales.clear();
    unpaidSales.forEach((sale) => {
      this.sales.push(
        this.fb.group({
          _id: [sale.taxVendor.salesId],
          salesInvoiceNumber: [sale.taxVendor.salesInvoice],
          amount: [
            sale.taxVendor.dueAmount,
            [
              Validators.required,
              Validators.min(sale.taxVendor.dueAmount),
              Validators.max(sale.taxVendor.dueAmount),
            ],
          ],
        })
      );
    });
  }
  addPurchaseControls(unpaidPurchases: any[]) {
    this.purchase.clear();
    unpaidPurchases.forEach((purchase) => {
      this.purchase.push(
        this.fb.group({
          _id: [purchase.taxVendor.purchaseId],
          purchaseInvoiceNumber: [purchase.taxVendor.purchaseInvoice],
          amount: [
            purchase.taxVendor.dueAmount,
            [
              Validators.required,
              Validators.min(purchase.taxVendor.dueAmount),
              Validators.max(purchase.taxVendor.dueAmount),
            ],
          ],
        })
      );
    });
  }

  totalSalesSelectedTotalAmount() {
    // Sum the total amount of the selected sales
    this.totalSelectedSalesTotalAmount = this.selectedSales.reduce(
      (total, sale) => total + (sale.taxVendor.taxVendorAmount || 0),
      0
    );
    this.totalSelectedSalesDueAmount = this.selectedSales.reduce(
      (total, sale) => total + (sale.taxVendor.dueAmount || 0),
      0
    );
    this.totalSelectedSalesPayableAmount = this.selectedSales.reduce(
      (total, sale) => total + (sale.taxVendor.dueAmount || 0),
      0
    );

    // Set the total amount in the form control
    this.addTaxVendorsPaymentForm.patchValue({
      payableAmount: this.totalSelectedSalesDueAmount.toFixed(2),
    });
  }
  totalPurchaseSelectedTotalAmount() {
    // Sum the total amount of the selected sales
    this.totalSelectedPurchaseTotalAmount = this.selectedPurchase.reduce(
      (total, purchase) => total + (purchase.taxVendor.taxVendorAmount || 0),
      0
    );
    this.totalSelectedPurchaseDueAmount = this.selectedPurchase.reduce(
      (total, purchase) => total + (purchase.taxVendor.dueAmount || 0),
      0
    );
    this.totalSelectedPurchasePayableAmount = this.selectedPurchase.reduce(
      (total, purchase) => total + (purchase.taxVendor.dueAmount || 0),
      0
    );

    // Set the total amount in the form control
    this.addTaxVendorsPaymentForm.patchValue({
      payableAmount: this.totalSelectedPurchaseDueAmount.toFixed(2),
    });
  }

  ngOnInit() {
    this.getTaxVendorsById();
    this.getPaymentListByVendorId();
    this.getVendorSalesList();
    this.getPurchasePaymentListByVendorId();
    this.getVendorPurchasesList();
  }

  getTaxVendorsById() {
    this.TaxVendorsService.getTaxVendorById(this.id).subscribe((data: any) => {
      console.log("Tax Vendors Data By Id", data.data);
      this.id = data.data._id;
      this.taxVendorsData = data.data;
    });
  }
  getVendorSalesList() {
    this.TaxVendorsService.getVendorSalesList(this.id).subscribe(
      (data: any) => {
        console.log("Tax Vendors Sales List Data By Id", data.data);
        this.salesDataShowById = data.data;
      }
    );
  }
  getVendorPurchasesList() {
    this.TaxVendorsService.getVendorPurchasesList(this.id).subscribe(
      (data: any) => {
        console.log("Tax Vendors Purchase List Data By Id", data.data);
        this.purchaseDataShowById = data.data;
      }
    );
  }
  getPaymentListByVendorId() {
    this.TaxVendorsService.getPaymentListByVendorId(this.id).subscribe(
      (data: any) => {
        console.log(this.id);
        console.log("Tax Vendors Sales Payment List Data By Id", data.data);
        this.paymentListDataByTaxVendorsId = data.data;
      }
    );
  }
  getPurchasePaymentListByVendorId() {
    this.TaxVendorsService.getPurchasePaymentListByVendorId(this.id).subscribe(
      (data: any) => {
        console.log(this.id);
        console.log("Tax Vendors Purchase Payment List Data By Id", data.data);
        this.purchasePaymentListDataByTaxVendorsId = data.data;
      }
    );
  }

  callAPi() {
    this.getPurchasePaymentListByVendorId();
    this.getPaymentListByVendorId();
    this.getVendorPurchasesList();
    this.getVendorSalesList();
    console.log("all Api called");
  }
  close() {
    this.displayPaymentDialog = false;
    this.showDialog = false;
    this.sales.clear();
    this.purchase.clear();
    this.selectedSales = null;
    this.selectedPurchase = null;
    this.totalSelectedSalesTotalAmount = 0;
    this.totalSelectedSalesDueAmount = 0;
    this.totalSelectedPurchaseTotalAmount = 0;
    this.totalSelectedPurchaseDueAmount = 0;
    this.addTaxVendorsPaymentForm.reset();
    this.callAPi();
  }
  callBackModal() {
    if (this.salesPaymentId) {
      this.TaxVendorsService.deletePayment(this.salesPaymentId).subscribe(
        (resp: any) => {
          this.showDialog = false;
          let message = "Tax Vendor Sales Payment has been Deleted";
          this.messageService.add({ severity: "success", detail: message });
          this.callAPi();
          this.salesPaymentId = null;
        }
      );
    } else if (this.purchasePaymentId) {
      this.TaxVendorsService.deletePurchaseTaxVendorPayment(
        this.purchasePaymentId
      ).subscribe((resp: any) => {
        let message = "Tax Vendor Purchase Payment has been Deleted";
        this.messageService.add({ severity: "success", detail: message });
        this.callAPi();
        this.showDialog = false;
        this.purchasePaymentId = null;
      });
    }
  }
  deleteTaxVendorSalesPayment(id) {
    console.log("sales delete dialog open");
    this.salesPaymentId = id;

    this.modalData = {
      title: "Delete",
      messege: "Are you sure you want to delete this Sales Payment",
    };
    this.showDialog = true;
  }
  deleteTaxVendorPurchasePayment(id) {
    console.log("Purchase delete dialog open");
    this.purchasePaymentId = id;

    this.modalData = {
      title: "Delete",
      messege: "Are you sure you want to delete this Purchase Payment",
    };
    this.showDialog = true;
  }

  // selectAllChange(event){
  //   console.log('event',event);

  // }

  openSalesPaymentDialog(sales) {
    this.selectedSales = [sales];
    const unpaidSales = this.selectedSales.filter(
      (sale) =>
        sale.taxVendor.dueAmount > 0 &&
        sale.taxVendor.paymentStatus === "Unpaid"
    );
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US"); // Format to MM/DD/YYYY

    this.addTaxVendorsPaymentForm.patchValue({
      paymentDate: formattedDate,
      paymentMode: "Bank",
    });

    console.log("these are unpaid sales", unpaidSales);
    if (unpaidSales.length > 0) {
      console.log("Payments to be made for these sales", unpaidSales);
      this.addSalesControls(unpaidSales); // Pass only unpaid sales to addSalesControls
      this.totalSalesSelectedTotalAmount(); // Calculate and store the total sales amount
      this.displayPaymentDialog = true;
    } else {
      this.messageService.add({
        severity: "error",
        summary: "No Sales Selected",
        detail: "Please select sales to process the payment.",
      });
    }
  }
  openPurchasePaymentDialog(purchase) {
    console.log(purchase);
    this.selectedPurchase = [purchase];
    this.selectedPurchase;
    console.log("selected purchase", this.selectedPurchase);
    const unpaidPurchases = this.selectedPurchase.filter(
      (purchase) =>
        purchase.taxVendor.dueAmount > 0 &&
        (purchase.taxVendor.paymentStatus === "Unpaid" ||
          purchase.taxVendor.paymentStatus === "Partial Paid")
    );
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US"); // Format to MM/DD/YYYY

    this.addTaxVendorsPaymentForm.patchValue({
      paymentDate: formattedDate,
      paymentMode: "Bank",
    });

    console.log("these are unpaid purchase", unpaidPurchases);
    if (unpaidPurchases.length > 0) {
      console.log("Payments to be made for these purchase", unpaidPurchases);
      this.addPurchaseControls(unpaidPurchases); // Pass only unpaid Purchase to addPurchaseControls
      this.totalPurchaseSelectedTotalAmount(); // Calculate and store the total Purchase amount
      this.displayPaymentDialog = true;
    } else {
      this.messageService.add({
        severity: "error",
        summary: "No Purchase Selected",
        detail: "Please select purchase to process the payment.",
      });
    }
  }

  addTaxVendorsPaymentFormSubmit() {
    const formData = this.addTaxVendorsPaymentForm.value;

    if (this.selectedSales && this.selectedSales.length > 0) {
      const payload = {
        taxVendor: {
          name: this.selectedSales[0].taxVendor.companyName,
          _id: this.selectedSales[0].taxVendor._id,
        },
        // sales: formData.sales,

        sales: formData.sales.map((sale) => ({
          _id: sale._id,
          salesInvoiceNumber: sale.salesInvoiceNumber,
          amount: formData.payableAmount, // Include payable amount
        })),
        paymentDate: formData.paymentDate,
        paymentMode: formData.paymentMode,
        note: formData.note,
      };
      console.log("valid form", this.addTaxVendorsPaymentForm.value);
      if (this.addTaxVendorsPaymentForm.valid) {
        console.log(payload);

        this.TaxVendorsService.createTaxVendorPayment(payload).subscribe(
          (resp: any) => {
            console.log(resp);
            if (resp) {
              if (resp.status === "success") {
                const message = " Sales Payment has been added";
                this.messageService.add({
                  severity: "success",
                  detail: message,
                });
                setTimeout(() => {
                  this.displayPaymentDialog = false;
                  this.callAPi();
                  // this.getPaymentListByVendorId();
                  // this.getVendorSalesList();
                  this.addTaxVendorsPaymentForm.reset();
                  this.sales.clear();
                  this.selectedSales = null;
                }, 400);
              } else {
                const message = resp.message;
                this.messageService.add({ severity: "error", detail: message });
              }
            }
          }
        );
      } else {
        console.log("invalid form");
      }
    }
    if (this.selectedPurchase && this.selectedPurchase.length > 0) {
      const payload = {
        taxVendor: {
          name: this.selectedPurchase[0].taxVendor.companyName,
          _id: this.selectedPurchase[0].taxVendor._id,
        },
        purchase: formData.purchase.map((sale) => ({
          _id: sale._id,
          purchaseInvoiceNumber: sale.purchaseInvoiceNumber,
          amount: formData.payableAmount, // Include payable amount
        })),
        paymentDate: formData.paymentDate,
        paymentMode: formData.paymentMode,
        note: formData.note,
      };
      console.log("valid form", this.addTaxVendorsPaymentForm.value);
      if (this.addTaxVendorsPaymentForm.valid) {
        console.log(payload);

        this.TaxVendorsService.createPurchaseTaxVendorPayment(
          payload
        ).subscribe((resp: any) => {
          console.log(resp);
          if (resp) {
            if (resp.status === "success") {
              const message = "Purchase Payment has been added";
              this.messageService.add({ severity: "success", detail: message });
              setTimeout(() => {
                this.displayPaymentDialog = false;
                // this.getPaymentListByVendorId();
                // this.getVendorSalesList();
                this.callAPi();

                this.addTaxVendorsPaymentForm.reset();
                this.purchase.clear();
                this.selectedPurchase = null;
              }, 400);
            } else {
              const message = resp.message;
              this.messageService.add({ severity: "error", detail: message });
            }
          }
        });
      } else {
        console.log("invalid form");
      }
    }
  }
}
