import { LiveAnnouncer } from "@angular/cdk/a11y";
import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  input,
  OnInit,
  Output,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSort, Sort } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { RouterModule } from "@angular/router";
import { MessageService } from "primeng/api";
import { Table, TableModule } from "primeng/table";
import { routes } from "src/app/shared/routes/routes";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { FormsModule } from "@angular/forms";
import { ConfirmDialogComponent } from "src/app/common-component/modals/confirm-dialog/confirm-dialog.component";
import { ShowHideDirective } from "src/app/common-component/show-hide-directive/show-hide.directive";
import { ToastModule } from "primeng/toast";
import { SharedModule } from "src/app/shared/shared.module";
import * as XLSX from "xlsx";
import { TooltipModule } from "ngx-bootstrap/tooltip";

@Component({
  selector: "app-table",
  templateUrl: "./table.component.html",
  styleUrls: ["./table.component.scss"],
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    TableModule,
    CommonModule,
    RouterModule,
    ButtonModule,
    TooltipModule,
    FormsModule,
    ConfirmDialogComponent,
    ShowHideDirective,
    ToastModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [MessageService],
})
export class VisitReasonListComponent implements OnInit {
  @Input() widthForColumn: string;
  @Input() columnSettingWithItemsKeys = []; // This is the column setting for the items and headers
  @Input() itemList = []; // This is the list of items you want to display
  @Input() tableWidth: {}; // This will be applied Key Value pairs exmaple {'width': '100%'}
  @Input() paginator: boolean; // This will be applied boolean values or you can give condaction to it
  @Input() rows: number; // rows to display
  @Input() rowsPerPageOptions = []; // number of rows to display in per page [10,20,30]
  @Input() sheetNames: string; // workes to display the sheet name
  @Input() onEditButtonShow: boolean;
  @Input() onDeleteButtonShow: boolean;
  @Input() pageTitle: string; // to display the title of the page
  @Output() navigateTo = new EventEmitter<void>();
  @Output() handleEmitEditTo = new EventEmitter<string>();
  @Output() handleEmitDeleteTo = new EventEmitter<string>();
  @ViewChild("dt2") dt2!: Table; // Access `p-table` with ViewChild
  public routes = routes;
  public VisitReasonData: any = [];
  showDataLoader: boolean = true;
  dynamicFields: string[] = [];
  cols!: any[];
  exportColumns!: any[];
  emitNavigate() { this.navigateTo.emit(); }
  handleEmitEdit(id: string) { this.handleEmitEditTo.emit(id); }
  handleEmitDelete(id: string) { this.handleEmitDeleteTo.emit(id); }

  constructor( public dialog: MatDialog, ) {
    this.showDataLoader = true;
  }

  filterGlobal(event: Event, filterMode: string) {
    const input = event.target as HTMLInputElement;
    this.dt2.filterGlobal(input.value, filterMode);
  }


  ngOnInit(): void {
    // Map the keys dynamically
    this.dynamicFields = this.columnSettingWithItemsKeys.map((col) => col.keys);
    if (this.itemList) {
      this.showDataLoader = false;
      this.exportColumns = this.columnSettingWithItemsKeys?.map((element) => ({
        title: element.header,
        dataKey: element.keys,
      }));
    }
  }

  // This function works for export excel file.
  /**
   * Exports the current item list to an Excel file.
   *
   * @remarks
   * This function transforms the item list into a format suitable for exporting to an Excel file.
   * It uses the `xlsx` library to create a new workbook, add a worksheet with the data, and save the workbook to a file.
   *
   * @param itemList - The list of items to be exported.
   * @param exportColumns - The columns to be included in the exported Excel file.
   * @param sheetNames - The name of the worksheet in the exported Excel file. If not provided, defaults to "Data Sheet".
   *
   * @returns {void}
   */
  exportToExcel() {
    // Transform the item list into a format suitable for exporting
    const dataToExport = this.itemList.map((item) => {
      const rowData = {};
      this.exportColumns.forEach((col) => {
        rowData[col.title] = item[col.dataKey];
      });
      return rowData;
    });

    // Create a new worksheet with the transformed data
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // Create a new workbook and add the worksheet
    const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };

    // Determine the file name based on the provided sheet name or default to "Data Sheet.xlsx"
    const fileName =
      this.sheetNames && this.sheetNames.trim() !== ""
        ? `${this.sheetNames}.xlsx`
        : "Data Sheet.xlsx";

    // Write the workbook to a file
    XLSX.writeFile(workbook, fileName);
  }

}
