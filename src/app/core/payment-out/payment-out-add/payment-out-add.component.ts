import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CalendarModule } from "primeng/calendar";
import { DropdownModule } from "primeng/dropdown";
import { routes } from "src/app/shared/routes/routes";
import { SharedModule } from "src/app/shared/shared.module";
import { CustomersdataService } from "../../Customers/customers.service";
import { PaymentOutService } from "../payment-out.service";
import { MessageService } from "primeng/api";
import { ToastModule } from "primeng/toast";
import { Router } from "@angular/router";
import { min } from "rxjs";
import { SuppliersdataService } from "../../Suppliers/suppliers.service";
import { PurchaseService } from "../../purchase/purchase.service";

@Component({
  selector: "app-payment-in-add",
  standalone: true,
  imports: [SharedModule],
  templateUrl: "./payment-out-add.component.html",
  styleUrl: "./payment-out-add.component.scss",
  providers: [MessageService],
})
export class PaymentOutAddComponent {
  public routes = routes;
  addPaymentOutForm!: FormGroup;
  SuppliersList = [];
  originalSuppliersData = [];
  maxDate = new Date();
  selectedCustomer: any;
  purchaseDataById = [];
  paymentModeList = [
    {
      paymentMode: "Cash",
    },
    {
      paymentMode: "Online",
    },
    {
      paymentMode: "Cheque",
    },
  ];

  notesRegex = /^(?:.{2,100})$/;
  nameRegex = /^(?=[^\s])([a-zA-Z\d\/\- ]{3,50})$/;
  noPaymentsAvailable: boolean = false;

  constructor(
    private SuppliersService: SuppliersdataService,
    private PurchaseService: PurchaseService,
    private Service: PaymentOutService,
    private messageService: MessageService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.addPaymentOutForm = this.fb.group({
      purchase: this.fb.array([]),
      supplier: ["", [Validators.required]],
      paymentDate: ["", [Validators.required]],
      taxablePaymentAmount: [""],
      nonTaxablePaymentAmount: [""],
      taxablePaymentMode: [""],
      nonTaxablePaymentMode: [""],
      note: ["", [Validators.pattern(this.notesRegex)]],
    });
  }

  get purchase(): FormArray {
    return this.addPaymentOutForm.get("purchase") as FormArray;
  }
  addpurchaseControls() {
    this.purchase.clear();
    this.purchaseDataById?.forEach((purchase) => {
      this.purchase.push(
        this.fb.group({
          _id: [purchase._id],
          
          purchaseInvoiceNumber: [purchase.purchaseInvoiceNumber],
          taxablePaymentAmount: [
            purchase.taxablePaymentAmount || '', 
            [
              Validators.required,
              Validators.min(0),
              Validators.max(purchase.taxableDue) // Set max value to taxableDue
            ]
          ],
          taxablePaymentMode: [purchase.taxablePaymentMode , Validators.required],  
          nonTaxablePaymentAmount: [
            purchase.nonTaxablePaymentAmount || '', 
            [
              Validators.required,
              Validators.min(0),
              Validators.max(purchase.nonTaxableDue) // Set max value to nonTaxableDue
            ]
          ],
          nonTaxablePaymentMode: [purchase.nonTaxablePaymentMode , Validators.required], 
          // note:[sale.note , Validators.pattern(this.notesRegex)], 
        })
      );
    });
  }

  getPurchaseControl(index: number): FormGroup {
    return (this.addPaymentOutForm.get('purchase') as FormArray).controls[index] as FormGroup;
  }
  

  ngOnInit(): void {
    this.SuppliersService.GetSupplierData().subscribe((resp: any) => {
      this.originalSuppliersData = resp;
      console.log("sfnsn", this.originalSuppliersData);
      this.SuppliersList = [];
      this.originalSuppliersData.forEach((element) => {
        this.SuppliersList.push({
          name: element.name,
          _id: {
            _id: element._id,
            name: element.name,
          },
        });
      });
    });
  }
  onSuppliersSelect(customerId: any) {
    console.log("hrlk adnns", customerId);
    this.PurchaseService.getPendingPurchaseBySupplierId(customerId).subscribe(
      (resp: any) => {
        if (resp && Array.isArray(resp.data)) {
          this.purchaseDataById = resp.data;

          if (this.purchaseDataById.length === 0) {
            this.noPaymentsAvailable = true; // Set flag to true if no payments are found
            console.log("No payments available for this supplier");
            // const message = "No payments available for this supplier";
            //   this.messageService.add({ severity: "warn", detail: message });
          } else {
            this.noPaymentsAvailable = false;
            this.addpurchaseControls();
            console.log("Payments found", this.purchaseDataById);
          }
        } else {
          this.purchaseDataById = [];
          this.noPaymentsAvailable = true; // No data returned, treat as no payments available
          console.log("No payments available or response is invalid");
          const message = "No payments available for this supplier";
          this.messageService.add({ severity: "warn", detail: message });
        }
      },
      (error) => {
        console.error("Error fetching payment data", error);
        this.purchaseDataById = [];
        this.noPaymentsAvailable = true; // Handle error scenario
        const message = "Error fetching payment data";
        this.messageService.add({ severity: "warn", detail: message });
      }
    );
  }

  addPaymentOutFormSubmit() {
    const formData = this.addPaymentOutForm.value;
    console.log("Submitted data:", formData);
    const supplierData = formData.supplier;

    const payload = formData.purchase.map((purchase) => {
      let paymentMode = '';
    
      if (purchase.taxablePaymentMode && purchase.nonTaxablePaymentMode) {
        paymentMode = purchase.taxablePaymentMode === purchase.nonTaxablePaymentMode 
          ? purchase.taxablePaymentMode 
          : `${purchase.taxablePaymentMode}/${purchase.nonTaxablePaymentMode}`;
      } else {
        paymentMode = purchase.taxablePaymentMode || purchase.nonTaxablePaymentMode;
      }
      return {
        supplier: {_id:supplierData._id,
          name:supplierData.name,
          billingAddress:supplierData.billingAddress || ""
         } ,
        paymentDate: formData.paymentDate,
        paymentMode: paymentMode, 
        purchase: [
          {
            _id: purchase._id,
            amount: purchase.taxablePaymentAmount + purchase.nonTaxablePaymentAmount, 
          },
        ],
        taxablePaymentAmount: purchase.taxablePaymentAmount
          ? {
              amount: purchase.taxablePaymentAmount,
              paymentMode: purchase.taxablePaymentMode,
            }
          : null,
        nonTaxablePaymentAmount: purchase.nonTaxablePaymentAmount
          ? {
              amount: purchase.nonTaxablePaymentAmount,
              paymentMode: purchase.nonTaxablePaymentMode,
            }
          : null,
        note: formData.note,
      };
    });

    if (this.addPaymentOutForm.valid) {
      console.log("valid form");

      this.Service.createPayment(payload).subscribe((resp: any) => {
        console.log(resp);
        if (resp) {
          if (resp.status === "success") {
            const message = "Payment has been added";
            this.messageService.add({ severity: "success", detail: message });
            setTimeout(() => {
              this.router.navigate(["/payment-out"]);
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
