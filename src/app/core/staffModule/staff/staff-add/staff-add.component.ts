import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { staffService } from '../staff-service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { routes } from "src/app/shared/routes/routes";
import { Router } from '@angular/router';
import { WarehouseService } from 'src/app/core/settings/warehouse/warehouse.service';


@Component({
  selector: 'app-staff-add',
  standalone: true,
  imports: [CommonModule,
    SharedModule,
    CalendarModule,
    DropdownModule,
    ToastModule],
  templateUrl: './staff-add.component.html',
  styleUrl: './staff-add.component.scss',
  providers: [MessageService]
})
export class StaffAddComponent {
  public routes = routes;
  addStaffForm!: FormGroup;
  public selectedValue!: string;

  Designation = [
    { value: "Select  Designation" },
    { value: "Labor" },
    { value: "Gaurd" },
    { value: "Accountant" },
    { value: "Sales Manager" },
    { value: "Transporter" },
    { value: "Marketing Manager" },
  ];
  warehouseData = [];
  personNameRegex = /^[^-\s][a-zA-Z0-9_\s-]{2,14}$/;
  // personNameRegex = /^(?! )[A-Za-z]{3,15}(?: [A-Za-z]{3,15})?$/;
  AddressRegex = /^(?! )[A-Za-z]{3,100}(?: [A-Za-z]{3,100})?$/;
  AccountNumberRegex = /^[0-9]{14}$/;
  phoneRegex = /^[0-9]{10}$/;
  IfscCodeRegex = /^[0-9]{11}$/;
  pinRegex = /^\d{6}$/;
  emailRegex: string =
    "^(?!.*\\s)[a-zA-Z0-9._%+-]{3,}@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
  constructor(
    private fb: FormBuilder,
    private service: staffService,
    private messageService: MessageService,
    private router: Router,
    private warehouseService: WarehouseService
  ) {
    this.addStaffForm = this.fb.group({
      upiId: ["", [Validators.pattern(this.personNameRegex)]],
      dateOfBirth: ["", Validators.required],
      warehouseDetails: ["", Validators.required],
      firstName: [
        "",
        [Validators.required, Validators.pattern(this.personNameRegex)],
      ],
      lastName: [
        "",
        [Validators.required, Validators.pattern(this.personNameRegex)],
      ],
      mobile: ["", [Validators.required, Validators.pattern(this.phoneRegex)]],
      email: ["", [Validators.pattern(this.emailRegex)]],
      pincode: ["", [Validators.required, Validators.pattern(this.pinRegex)]],
      designation: ["", [Validators.required]],
      city: ["", [Validators.required, Validators.pattern(this.AddressRegex)]],
      address: ["", [Validators.pattern(this.AddressRegex)]],
      bankName: ["", [Validators.pattern(this.AddressRegex)]],
      accountName: ["", [Validators.pattern(this.AddressRegex)]],
      accountNumber: ["", [Validators.pattern(this.AccountNumberRegex)]],
      ifscCode: ["", [Validators.pattern(this.IfscCodeRegex)]],
    });
  }

  ngOnInit(): void {
    this.warehouseService.getAllWarehouseList().subscribe((resp: any) => {
      this.warehouseData = resp.data;
    });
  }

  addStaffFormSubmit() {
    const formData = this.addStaffForm.value
    const paylode = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formData.dateOfBirth,
      mobile: formData.mobile,
      designation: formData.designation,
      warehouseDetails: formData.warehouseDetails,
      pinCode: formData.pincode,
      city: formData.city,
      email: formData.firstName,
      upiId: formData.upiId,
      bankName: formData.bankName,
      accountName: formData.accountName,
      accountNumber: formData.accountNumber,
      ifscCode: formData.ifscCode,
      address: formData.address,

      
    };
    if (this.addStaffForm.valid) {
      console.log("Form is valid", this.addStaffForm.value);
      this.service.addStaffData(paylode).subscribe((resp: any) => {
        if (resp) {
          if (resp.status === "success") {
            const message = "Staff has been added";
            this.messageService.add({ severity: "success", detail: message });
            setTimeout(() => {
              this.router.navigate(["/staff"]);
            }, 400);
          } else {
            const message = resp.message;
            this.messageService.add({ severity: "error", detail: message });
          }
        }
      });
    } else {
      console.log("Form is inValid!");
    }
  }

}