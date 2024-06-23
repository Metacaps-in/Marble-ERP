import { Component, OnInit } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import { ReportsService } from '../reports.service';

@Component({
  selector: 'app-purchase-reports',
  // standalone: true,
  // imports: [],
  templateUrl: './purchase-reports.component.html',
  styleUrl: './purchase-reports.component.scss'
})
export class PurchaseReportsComponent {
  public routes = routes;
  picker1: any;
  searchDataValue = ""
  rangeDates: Date[] | undefined;
  purchaseReportsData = [];
  originalData = [];

  searchByData = [
    "Today", "Yesterday", "Last 7 Days", "This Month", "Last 3 Months", "Last 6 Months", "This Year"
  ];

  constructor(
    private service:ReportsService
  ) {

  }

  getPaymentOutReportData(startDate: Date, endDate: Date){
    const formattedStartDate = this.formatDate(startDate);
    const formattedEndDate = this.formatDate(endDate);

    const data = {
      startDate: formattedStartDate,
      endDate: formattedEndDate
    };
    const data2 = {
      startDate: "",
      endDate: "",
    };

    this.service.getPurchaseReports(data).subscribe((resp:any) => {
      console.log(resp);
      this.purchaseReportsData = resp.purchases
      this.originalData = resp.purchases
    });
  }



  onDateChange(value: any): void {
    const startDate = value[0];
    const endDate = value[1];
    this.getPaymentOutReportData(startDate, endDate);
  }

  
  ngOnInit(): void {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = today;
    this.rangeDates = [startDate, endDate];

    this.getPaymentOutReportData(startDate, endDate);
  }


  onSearchByChange(event: any) {
    const value = event.value;
    const today = new Date();
    let startDate, endDate = today;
    switch (value) {
      case 'Today':
        startDate = today;
        endDate = today;
        break;
      case 'YesterDay':
        startDate = new Date(today.setDate(today.getDate() - 1));
        endDate = startDate;
        break;
      case 'Last 7 Days':
        startDate = new Date(today.setDate(today.getDate() - 7));
        endDate = new Date();
        break;
      case 'This Month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'Last 3 Months':
        startDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
        break;
      case 'Last 6 Months':
        startDate = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
        break;
      case 'This Year':
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
    }

    this.rangeDates = [startDate, endDate];
    this.getPaymentOutReportData(startDate, endDate);
  }

  formatDate(date: Date): string {
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based, so add 1
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  public searchData(value: any): void {
    this.purchaseReportsData = this.originalData.filter(i =>
      i.supplier.name
      .toLowerCase().includes(value.trim().toLowerCase())
    );
  }


}

// last 3 month=>{
// today.getFullYear() return year = 2024;
// today.getMonth() return this month = 5 = june ; because jan index is 0 ;
// so 5- 3 = 2 = march;
// today.getDate( return) today date = 6 ;
// startdate= new Date(2024, 2, 6) = it return new date = 03/06/2024 
// }