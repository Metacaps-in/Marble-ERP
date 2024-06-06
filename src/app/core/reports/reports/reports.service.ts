import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  constructor(private http: HttpClient) { }

  getPaymentInReports(data: {} | null) {
    return this.http.post(environment.apiUrl + "/PaymentInController/getPaymentInReports", data);
  }

  getSalesReports(data: {} | null) {
    return this.http.post(environment.apiUrl + "/SalesReportController/getSalesReports", data);
  }
}
