import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CalendarModule } from "primeng/calendar";
import { DropdownModule } from "primeng/dropdown";
import { routes } from "src/app/shared/routes/routes";
import { SharedModule } from "src/app/shared/shared.module";
import { CustomersdataService } from "../../Customers/customers.service";
import { PaymentInService } from "../payment-in.service";
import { MessageService } from "primeng/api";
import { ToastModule } from "primeng/toast";
import { Router } from "@angular/router";
import { min } from "rxjs";

@Component({
  selector: "app-payment-in-add",
  standalone: true,
  imports: [SharedModule],
  templateUrl: "./payment-in-add.component.html",
  styleUrl: "./payment-in-add.component.scss",
  providers: [MessageService],
})
export class PaymentInAddComponent {
  public routes = routes;
  addPaymentInForm!: FormGroup;
  customerList = [];
  originalCustomerData = [];
  salesDataById = [];
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
    {
      paymentMode: "Cheque",
    },
    
  ];
  maxDate = new Date();
  notesRegex = /^(?:.{2,100})$/;
  nameRegex = /^(?=[^\s])([a-zA-Z\d\/\- ]{3,50})$/;
  noPaymentsAvailable: boolean;

  constructor(
    private customerService: CustomersdataService,
    private Service: PaymentInService,
    private messageService: MessageService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.addPaymentInForm = this.fb.group({
      sales: this.fb.array([]),
      customer: ["", [Validators.required]],
      paymentDate: ["", [Validators.required]],
      taxablePaymentAmount:[''],
      nonTaxablePaymentAmount: [''],
      taxablePaymentMode: [""],
      nonTaxablePaymentMode: [""],
      note: ["", [Validators.pattern(this.notesRegex)]],
    });
  }
  get sales(): FormArray {
    return this.addPaymentInForm.get("sales") as FormArray;
  }

  addSalesControls() {
    this.sales.clear();
    this.salesDataById.forEach((sale) => {
      this.sales.push(
        this.fb.group({
          _id: [sale._id],
          salesInvoiceNumber: [sale.salesInvoiceNumber],
          taxablePaymentAmount: [
            sale.taxableDue || '', 
            [
              
              Validators.min(0),
              Validators.max(sale.taxableDue) // Set max value to taxableDue
            ]
          ],
          taxablePaymentMode: ["Bank" , Validators.required],  
          nonTaxablePaymentAmount: [
            sale.nonTaxableDue || '', 
            [
              
              Validators.min(0),
              Validators.max(sale.nonTaxableDue) // Set max value to nonTaxableDue
            ]
          ],
          nonTaxablePaymentMode: ["Cash" , Validators.required], 
          // note:[sale.note , Validators.pattern(this.notesRegex)], 
        })
      );
    });
  }


  getSalesControl(index: number): FormGroup {
    return (this.addPaymentInForm.get('sales') as FormArray).controls[index] as FormGroup;
  }
  ngOnInit(): void {
    this.customerService.GetCustomerData().subscribe((resp: any) => {
      this.originalCustomerData = resp;
      this.customerList = [];
      this.originalCustomerData.forEach((element) => {
        this.customerList.push({
          name: element.name,
          _id: {
            _id: element._id,
            name: element.name,
          },
        });
      });
    });
  }
  onCustomerSelect(customerId: any) {
    console.log("Customer Id", customerId);

    this.Service.getSalesByCustomerId(customerId).subscribe(
      (resp: any) => {
        if (resp && Array.isArray(resp.data)) {
          this.salesDataById = resp.data;
          console.log("this is data",this.salesDataById)
          if (this.salesDataById.length === 0) {
            this.noPaymentsAvailable = true; // Set flag to true if no payments are found
            console.log("No payments available for this Customer");
            // const message = "No payments available for this Customer";
            //   this.messageService.add({ severity: "warn", detail: message });
          } else {
            const today = new Date();
            const formattedDate = today.toLocaleDateString("en-US"); // Format to MM/DD/YYYY
        
            this.addPaymentInForm.patchValue({
              paymentDate: formattedDate,
            });
        
            this.noPaymentsAvailable = false;
            this.addSalesControls();
            console.log("Payments found", this.salesDataById);
          }
        } else {
          this.salesDataById = [];
          this.noPaymentsAvailable = true; // No data returned, treat as no payments available
          console.log("No payments available or response is invalid");
          const message = "No payments available for this Customer";
          this.messageService.add({ severity: "warn", detail: message });
        }
      },
      (error) => {
        console.error("Error fetching payment data", error);
        this.salesDataById = [];
        this.noPaymentsAvailable = true; // Handle error scenario
        const message = error.message;
        this.messageService.add({ severity: "warn", detail: message });
      }
    );
  }

  addPaymentInFormSubmit() {
    const formData = this.addPaymentInForm.value;
    console.log("Submitted data:", formData);
    const customerData = formData.customer;

    const payload = formData.sales.map((sale) => {
      let paymentMode = '';
    
      if (sale.taxablePaymentMode && sale.nonTaxablePaymentMode) {
        paymentMode = sale.taxablePaymentMode === sale.nonTaxablePaymentMode 
          ? sale.taxablePaymentMode 
          : `${sale.taxablePaymentMode}/${sale.nonTaxablePaymentMode}`;
      } else {
        paymentMode = sale.taxablePaymentMode || sale.nonTaxablePaymentMode;
      }
      return {
        customer: {_id:customerData._id,
          name:customerData.name,
          billingAddress:customerData.billingAddress || ""
         } ,
        paymentDate: formData.paymentDate,
        paymentMode: paymentMode, 
        sales: [
          {
            _id: sale._id,
            amount: sale.taxablePaymentAmount + sale.nonTaxablePaymentAmount, 
          },
        ],
        taxablePaymentAmount: sale.taxablePaymentAmount
          ? {
              amount: sale.taxablePaymentAmount,
              paymentMode: sale.taxablePaymentMode,
            }
          : null,
        nonTaxablePaymentAmount: sale.nonTaxablePaymentAmount
          ? {
              amount: sale.nonTaxablePaymentAmount,
              paymentMode: sale.nonTaxablePaymentMode,
            }
          : null,
        note: formData.note,
      };
    });
    if (this.addPaymentInForm.valid) {
      console.log("valid form");

      this.Service.createPayment(payload).subscribe((resp: any) => {
        console.log(resp);
        if (resp) {
          if (resp.status === "success") {
            const message = "Payment has been added";
            this.messageService.add({ severity: "success", detail: message });
            setTimeout(() => {
              this.router.navigate(["/payment-in"]);
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
