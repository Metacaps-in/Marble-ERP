import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { MessageService, SharedModule } from "primeng/api";
import { CalendarModule } from "primeng/calendar";
import { DialogModule } from "primeng/dialog";
import { DropdownModule } from "primeng/dropdown";
import { TableModule } from "primeng/table";
import { TabViewModule } from "primeng/tabview";
import { ToastModule } from "primeng/toast";
import { PaymentInService } from "src/app/core/payment-in/payment-in.service";
import { PaymentOutService } from "src/app/core/payment-out/payment-out.service";
import { SalesReturnService } from "src/app/core/sales-return/sales-return.service";
import { SalesService } from "src/app/core/sales/sales.service";

@Component({
  selector: "app-payments-invoice-dialog",
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    TableModule,
    DialogModule,
    ToastModule,
    TabViewModule,
    SharedModule,
    FormsModule,
    CalendarModule,
    DropdownModule,
    ReactiveFormsModule,
  ],
  templateUrl: "./payments-invoice-dialog.component.html",
  styleUrl: "./payments-invoice-dialog.component.scss",
})
export class PaymentsInvoiceDialogComponent implements OnInit {
  @Input() ShowPaymentInvoice: boolean;
  @Input() dataById: any = [];
  @Output() callbackModalForPayment = new EventEmitter<any>();
  @Output() close = new EventEmitter<any>();
  paymentInvoiceForm: FormGroup;
  payableAmounts: string[] = [];
  routes: { customers: string };
  paymentModeList = [
    {
      paymentMode: "Cash",
    },
    {
      paymentMode: "Bank",
    },
  ];
  dueAmount = this.dataById.dueAmount;

  notesRegex = /^(?:.{2,100})$/;

  constructor(
    private paymentInService: PaymentInService,
    private paymentOutService: PaymentOutService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private salesReturnService: SalesReturnService
  ) {
    this.paymentInvoiceForm = this.fb.group({
      paymentDate: ["", [Validators.required]],
      paymentMode: ["", [Validators.required]],
      note: ["", [Validators.required]],
      // totalAmount: ["", [Validators.required,this.amountExceedsTotalValidator.bind(this)]],
      totalAmount: ["", [Validators.required, Validators.max(this.dueAmount)]],
    });
  }

  ngOnInit() {}

  closeTheWindow() {
    this.close.emit();
    this.paymentInvoiceForm.reset();
    // this.dataById=[]
  }

  onConfirm() {
    this.callbackModalForPayment.emit();
  }

  paymentInvoiceFormSubmit() {
    // console.log(this.dataById);
    const formData = this.paymentInvoiceForm.value;
    console.log("this is form data",formData)
    if (this.dataById.isSalesReturn) {
      const payload = {
        customer: this.dataById.customer,
        paymentDate: formData.paymentDate,
        paymentMode: formData.paymentMode,
        salesReturnId: this.dataById.salesReturnId,
        amount: formData.totalAmount,
        note: formData.note,
      };
      if (this.paymentInvoiceForm.valid) {
        this.salesReturnService.createSalesReturnPayment(payload).subscribe((resp: any) => {
          console.log(resp);
          if (resp) {
            if (resp.status === "success") {
              const message = "Payment Out has been added";
              this.messageService.add({ severity: "success", detail: message });
              setTimeout(() => {
                this.close.emit();
                this.paymentInvoiceForm.reset();
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

    if (this.dataById.isSales) {
      const payload = {
        customer: this.dataById.customer,
        paymentDate: formData.paymentDate,
        paymentMode: formData.paymentMode,
        sales: [
          {
            _id: this.dataById.salesId,
            amount: formData.totalAmount,
          },
        ],
        note: formData.note,
      };

      if (this.paymentInvoiceForm.valid) {
        this.paymentInService.createPayment(payload).subscribe((resp: any) => {
          console.log(resp);
          if (resp) {
            if (resp.status === "success") {
              const message = "Payment has been added";
              this.messageService.add({ severity: "success", detail: message });
              setTimeout(() => {
                this.close.emit();
                this.paymentInvoiceForm.reset();
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
    // console.log(formData)
    // const payload = {
    //   customer: this.dataById.customer,
    //   paymentDate: formData.paymentDate,
    //   paymentMode: formData.paymentMode,
    //   sales: [
    //     {
    //       _id: this.dataById.salesId,
    //       amount: formData.totalAmount,
    //     }
    //   ],
    //   notes: formData.notes,
    // }

    // if (this.paymentInvoiceForm.valid) {
    //   this.paymentInService.createPayment(payload).subscribe((resp: any) => {
    //     console.log(resp);
    //     if (resp) {
    //       if (resp.status === "success") {
    //         const message = "Payment has been added";
    //         this.messageService.add({ severity: "success", detail: message });
    //         setTimeout(() => {
    //           this.close.emit();
    //           this.paymentInvoiceForm.reset();
    //         }, 400);
    //       } else {
    //         const message = resp.message;
    //         this.messageService.add({ severity: "error", detail: message });
    //       }
    //     }
    //   });
    // }
    // else {
    //   console.log("invalid form");

    // }
  }
}
