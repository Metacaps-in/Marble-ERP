import { Component, OnInit } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import { ReportsService } from '../reports.service';
import { dashboardService } from 'src/app/core/dashboard/dashboard.service';

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
  startDate: Date;
  endDate: Date;
  purchaseReportsData = [];
  originalData = [];
  purchaseReports = 'purchaseReports';
  cols = [];
  exportColumns = [];

  searchByData = [
    "Today",
    "YesterDay",
    "This Week",
    "Last Week",
    "This Month",
    "Last Month",
    "This Quarter",
    "Last Quarter",
    "This Year",
    "Last Year",
  ];
  searchBy: string;

  constructor(
    private service: ReportsService,
    private datefilter : dashboardService
  ) {

  }

  
  private formatDateForFilename(date: Date): string {
    return date.toLocaleDateString('en-GB').replace(/\//g, '-'); // e.g., 19-02-2024
  }

  // Function to generate the export filename
  getExportFilename(): string {
    const formattedStartDate = this.formatDateForFilename(this.startDate);
    const formattedEndDate = this.formatDateForFilename(this.endDate);
    return `Purchase Reports ${formattedStartDate} ${formattedEndDate}`;
  }

  getPaymentOutReportData(startDate: Date, endDate: Date) {
    this.startDate = startDate;
    this.endDate = endDate;
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

    this.service.getPurchaseReports(data).subscribe((resp: any) => {
      console.log(resp);
      this.purchaseReportsData = resp.purchases
      this.originalData = resp.purchases
      this.cols = [
        { field: 'purchaseDate', header: 'Purchase Date' },
        { field: 'purchaseInvoiceNumber', header: 'Purchase Invoice Number' },
        { field: 'supplier.name', header: 'Supplier' },
        { field: 'purchaseType', header: 'Purchase Type' },
        { field: 'paymentStatus', header: 'Payment Status' },
        { field: 'purchaseCost', header: 'Purchase Cost' },
        { field: 'purchaseTotalAmount', header: 'Purchase Total Amount' },
        { field: 'paidAmount', header: 'Paid Amount' },
        { field: 'dueAmount', header: 'Due Amount' }
      ];

      this.exportColumns = this.cols.map(col => ({
        title: col.header,
        dataKey: col.field
      }));
    });
    // this.exportColumns = this.purchaseReportsData.map((element) => ({ title: element.header, dataKey: element.field }));
  }

  onFilter(value: any) {
    this.purchaseReportsData = value.filteredValue;
}



  onDateChange(value: any): void {
    const startDate = value[0];
    const endDate = value[1];
    this.getPaymentOutReportData(startDate, endDate);
    let payload = {
      endDate: endDate,
      startDate: startDate,
    };

    this.datefilter.updAtedateRange(payload).subscribe((resp) => {
      console.log("updt date resp", resp);
    });
  }


  ngOnInit(): void {
    let startDate: Date;
    let endDate: Date;
    this.datefilter.getUpdatedTime().subscribe((resp: any) => {
      let dates = resp.data;
      console.log("Received Dates:", dates);

      if (dates.startUtc && dates.endUtc) {
        startDate = new Date(dates.startUtc);
        endDate = new Date(dates.endUtc);
        this.searchBy = dates.filterby
      } else {
        console.log(" Dates:");
        startDate = new Date(new Date().getFullYear(), 0, 1);
        endDate = new Date();
        this.searchBy = "This Year";
      }

      console.log(" Dates:>>", startDate, endDate);
      const Sdate = this.formatDate(startDate);
      const Edate = this.formatDate(endDate);

      this.rangeDates = [startDate, endDate];
      console.log("Formatted Dates:", Sdate, Edate);

      this.getPaymentOutReportData(startDate, endDate);
    });

 
  }



  onSearchByChange(event: any) {
    console.log(event);
    const value = event.value;
    const today = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = new Date(today);

    switch (value) {
      case "Today":
        startDate = new Date(today);
        break;

      case "YesterDay":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 1);
        endDate = new Date(startDate);
        break;

      case "This Week":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay() + 1); // Start from Monday
        break;

      case "Last Week":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay() - 6); // Last Monday
        endDate = new Date(today);
        endDate.setDate(startDate.getDate() + 6); // Last Sunday
        break;

      case "This Month":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;

      case "Last Month":
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0); // Last day of previous month
        break;

      case "This Quarter":
        const currentQuarter = Math.floor(today.getMonth() / 3);
        startDate = new Date(today.getFullYear(), currentQuarter * 3, 1);
        break;

      case "Last Quarter":
        const lastQuarter = Math.floor(today.getMonth() / 3) - 1;
        const yearForLastQuarter =
          lastQuarter < 0 ? today.getFullYear() - 1 : today.getFullYear();
        startDate = new Date(
          yearForLastQuarter,
          (lastQuarter < 0 ? 3 : lastQuarter) * 3,
          1
        );
        endDate = new Date(
          startDate.getFullYear(),
          startDate.getMonth() + 3,
          0
        );
        break;

      case "This Year":
        startDate = new Date(today.getFullYear(), 0, 1);
        break;

      case "Last Year":
        startDate = new Date(today.getFullYear() - 1, 0, 1);
        endDate = new Date(today.getFullYear() - 1, 11, 31);
        break;

      default:
        startDate = null;
        endDate = null;
        break;
    }

    this.rangeDates = [startDate, endDate];

    if (startDate && endDate) {
      const formattedDate1 = this.formatDate(startDate);
      const formattedDate2 = this.formatDate(endDate);
      console.log("Start Date:", formattedDate1, "End Date:", formattedDate2);
      this.getPaymentOutReportData(startDate, startDate);

      let payload = {
        filterby: value,
        endDate: formattedDate2,
        startDate: formattedDate1,
      };

      this.datefilter.updAtedateRange(payload).subscribe((resp) => {
        console.log("updt date resp", resp);
      });
    }
  }

  formatDate(date: Date): string {
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based, so add 1
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  public searchData(value: any): void {
    this.purchaseReportsData = this.originalData.filter(i => {
      if (!i.supplier || !i.supplier.name) {
        console.warn('Missing supplier or supplier name:', i);
        return false;
      }
      return i.supplier.name.toLowerCase().includes(value.trim().toLowerCase());
    });
  }
  getTotalPaidAmount(): number {
    return this.purchaseReportsData.reduce(
      (total, payment) => total + parseFloat(payment.paidAmount),
      0
    );
  }

  getTotalDueAmount(): number {
    return this.purchaseReportsData.reduce(
      (sum, item) => sum + parseFloat(item.dueAmount),
      0
    );
  }
  getTotalSupplierAmount(): number {
    return this.purchaseReportsData.reduce(
      (sum, item) => sum + parseFloat(item.purchaseCost),
      0
    );
  }

  getTotalPurchaseAmount(): number {
    return this.purchaseReportsData.reduce(
      (sum, item) => sum + parseFloat(item.purchaseTotalAmount),
      0
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