import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { routes } from "src/app/shared/routes/routes";
import { CustomersdataService } from '../../Customers/customers.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SalesReturnService } from '../sales-return.service';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { TabViewModule } from 'primeng/tabview';
import { InvoiceDialogComponent } from 'src/app/common-component/modals/invoice-dialog/invoice-dialog.component';

@Component({
  selector: 'app-all-sales-return',
  templateUrl: './all-sales-return.component.html',
  styleUrl: './all-sales-return.component.scss',
  providers: [MessageService],
  standalone: true,
  imports: [CommonModule, SharedModule, DropdownModule, CalendarModule, ToastModule, DialogModule,TabViewModule, InvoiceDialogComponent]
})
export class AllSalesReturnComponent implements OnInit {
  public routes = routes;

  public searchDataValue = '';
  selectedSales = '';
  saleId: any;
  showDialoge = false;
  modalData: any = {};
originalData = [];
showInvoiceDialog: boolean = false;
  salesReturnListData = []  

  salesDataShowById: any;
  paymentDataListById: any[] = [];



  constructor(
    private messageService: MessageService,
    private router: Router,
    public dialog: MatDialog,
    private Service: SalesReturnService) { }

  ngOnInit() {
    this.GetSalesReturnData();

  }

  deleteSalesReturn(Id: any) {
    this.saleId = Id;

    this.modalData = {
      title: "Delete",
      messege: "Are you sure you want to delete this Sales Return Details"
    }
    this.showDialoge = true;
  }

  showNewDialog() {
    this.showDialoge = true;
  }

  callBackModal() {
    this.Service.deleteSalesReturn(this.saleId).subscribe((resp: any) => {
      this.messageService.add({ severity: 'success', detail: resp.message });
      this.GetSalesReturnData();
      this.showDialoge = false;
    })
  }

  close() {
    this.showDialoge = false;
    this.showInvoiceDialog = false;

    this.GetSalesReturnData();
  }

  GetSalesReturnData() {
    this.Service.getSalesReturnList().subscribe((resp: any) => {
      this.salesReturnListData = resp.data;
      this.originalData = resp.data;
      
    })
  }
  editSalesRout(id) {
    this.router.navigate(["/sales-return/edit-sales-return/" + id]);
  }

  // showDialog(id:any ){
  //   let totalTax =0;
  //   this.visible = true;
  //   this.Service.getSalesReturnById(id).subscribe((resp: any) => {
  //     this.salesReturnDataById = [resp.data];

  //     resp.data.appliedTax.forEach(element => {
  //       totalTax += Number(element.taxRate);
  //     });
  //     this.addTaxTotal = resp.data.salesGrossTotal * totalTax / 100;
  //     console.log("applied tax", resp.data.appliedTax);
  //   })

  // }


  showReturnInvoiceDialoge(Id: any) {   // to open the sales invoice popup
    console.log("id pass to invoice dialoge", Id);
    console.log("showInvoiceDialoge is triggered ")
    this.Service.getSalesReturnById(Id).subscribe((resp: any) => {
      this.showInvoiceDialog = true;
      this.salesDataShowById = [resp.data];
      console.log("sales data by id On dialog", this.salesDataShowById);
    });

    this.Service.getSalesReturnPaymentListBySalesReturnId(Id).subscribe((resp:any)=>{
      this.paymentDataListById=resp.data;
    })

  }



}
