import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { routes } from 'src/app/shared/routes/routes';
import { SharedModule } from 'src/app/shared/shared.module';
import { CustomersdataService } from '../../Customers/customers.service';
import { PaymentInService } from '../payment-in.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-in-add',
  standalone: true,
  imports: [CommonModule, SharedModule, DropdownModule, CalendarModule, ToastModule],
  templateUrl: './payment-in-add.component.html',
  styleUrl: './payment-in-add.component.scss',
  providers: [MessageService]
})
export class PaymentInAddComponent {
  public routes = routes
  addPaymentInForm! : FormGroup;
  customerList= [];
  selectedCustomer: any;
  salesDataById = [];
  // sales: any;
  amount:any = {}
  paymentModeList = [{
    paymentMode: 'Cash'
  },
{
  paymentMode:'Online'
}];


  constructor( 
    private customerService: CustomersdataService,
    private Service: PaymentInService,
    private messageService: MessageService,
    private router: Router,
    private fb: FormBuilder
  ){
    this.addPaymentInForm = this.fb.group({
      sales: this.fb.array([]),
      customer: [''],
      paymentDate: [''],
      paymentMode: [''],
      note: [''],
    });
    
  }
  addSalesControls() {
    const salesArray = this.addPaymentInForm.get('sales') as FormArray;
    this.salesDataById.forEach(sale => {
      salesArray.push(this.fb.group({
        _id: [sale._id],
        amount: ['']
      }));
    });
  }
  

  ngOnInit(): void {
    this.customerService.GetCustomerData().subscribe((resp: any) => {
      this.customerList = resp;
    });
  
  }
  onCustomerSelect(customerId: any){
   
    this.Service.getSalesByCustomerId(customerId).subscribe((resp:any) => {
      this.salesDataById = resp.data;
      console.log("sales Data by id ",this.salesDataById);
      this.addSalesControls();
      this.addPaymentInForm.get('customer').setValue(this.salesDataById[0].customer)
      console.log("selcted ", this.salesDataById);
    });
    
  }


  addPaymentInFormSubmit(){
    const formData = this.addPaymentInForm.value;
    console.log('Submitted data:', formData);

    const selectedCustomerId = this.addPaymentInForm.get('customer').value?._id;
    const selectedCustomerName = this.addPaymentInForm.get('customer').value?.name;

    const payload = {
      customer: {
        _id: selectedCustomerId,
        name: selectedCustomerName
      },
      sales: formData.sales,
      paymentDate: formData.paymentDate,
      paymentMode: formData.paymentMode,
      note: formData.note
    }

    console.log(this.amount)

    
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
    }
    else {
      console.log("invalid form");

    }

  }

}
