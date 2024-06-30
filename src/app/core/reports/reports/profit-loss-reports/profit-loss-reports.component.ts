import { Component, OnInit } from "@angular/core";
import { routes } from "src/app/shared/routes/routes";
import { ReportsService } from "../reports.service";

@Component({
  selector: 'app-profit-loss-reports',
  templateUrl: './profit-loss-reports.component.html',
  styleUrl: './profit-loss-reports.component.scss'
})
export class ProfitLossReportsComponent{
  public routes = routes;
  picker1: any;
  searchDataValue = ""  
  rangeDates: Date[] | undefined;
  profitLossData:any = {};

  searchByData = [
    "Today", "Yesterday", "Last 7 Days", "This Month", "Last 3 Months", "Last 6 Months", "This Year"
  ];
  searchBy: string;

  constructor(
    private service:ReportsService
  ) { }

  getPaymentInReportData(startDate: Date, endDate: Date){
    const formattedStartDate = this.formatDate(startDate);
    const formattedEndDate = this.formatDate(endDate);

    const data = {
      startDate: formattedStartDate,
      endDate: formattedEndDate
    };

    this.service.getProfitLoss(data).subscribe((resp: any) => {
          this.profitLossData = resp.data.results;      
    });
  }

  downloadProfitLoss(){
    console.log(this.rangeDates);
    const formattedStartDate = this.formatDate(this.rangeDates[0]);
    const formattedEndDate = this.formatDate(this.rangeDates[1]);

    const data = {
      startDate: formattedStartDate,
      endDate: formattedEndDate
    };
    
    this.service.downloadProfitLoss(data).subscribe((response: ArrayBuffer) => {
      const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', 'profit_loss.xlsx'); // Replace with your desired file name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  onDateChange(value: any): void {
    const startDate = value[0];
    const endDate = value[1];
    this.getPaymentInReportData(startDate, endDate);
  }
  
  ngOnInit(): void {
    const today = new Date();
    const endDate = new Date();
    const startDate = new Date(today.getFullYear(), 3, 1);
    this.searchBy = 'This Year';
    this.rangeDates = [startDate, endDate];

    this.getPaymentInReportData(startDate, endDate);
  }


  onSearchByChange(event: any) {
    const value = event.value;
    const today = new Date();
    let startDate, endDate = today;
    switch (value) {
      case 'Today':
        startDate = new Date(today);
        endDate = new Date(today);
        break;
      case 'Yesterday':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 1);
        endDate = new Date(startDate);
        break;
      case 'Last 7 Days':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        endDate = new Date(today);
        break;
      case 'This Month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today);
        break;
      case 'Last 3 Months':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 3);
        endDate = new Date(today);
        break;
      case 'Last 6 Months':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 6);
        endDate = new Date(today);
        break;
      case 'This Year':
        if (today.getMonth() >= 3) { // Current month is April (3) or later
          startDate = new Date(today.getFullYear(), 3, 1); // April 1st of current year
        } else {
          startDate = new Date(today.getFullYear() - 1, 3, 1); // April 1st of previous year
        }
        endDate = new Date(today);
        break;
      default:
        startDate = null;
        endDate = null;
        break;
    }

    this.rangeDates = [startDate, endDate];
    this.getPaymentInReportData(startDate, endDate);
  }

  formatDate(date: Date): string {
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based, so add 1
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }



}

// last 3 month=>{
// today.getFullYear() return year = 2024;
// today.getMonth() return this month = 5 = june ; because jan index is 0 ;
// so 5- 3 = 2 = march;
// today.getDate( return) today date = 6 ;
// startdate= new Date(2024, 2, 6) = it return new date = 03/06/2024 
// }