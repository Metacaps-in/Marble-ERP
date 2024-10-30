import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { Router, RouterModule } from "@angular/router";
import { TableModule } from "primeng/table";
import { routes } from "src/app/shared/routes/routes";
import { ButtonModule } from "primeng/button";
import { FormsModule } from "@angular/forms";
import { ConfirmDialogComponent } from "src/app/common-component/modals/confirm-dialog/confirm-dialog.component";
import { ShowHideDirective } from "src/app/common-component/show-hide-directive/show-hide.directive";
import { ToastModule } from "primeng/toast";
import { AddTaxesComponent } from "../add-taxes/add-taxes.component";
import { EditTaxesComponent } from "../edit-taxes/edit-taxes.component";
import { TaxesService } from "../taxes.service";
import { FilterPipe } from "src/app/core/filter.pipe";
import { SharedModule } from "src/app/shared/shared.module";
import { MessageService } from "primeng/api";
import { VisitReasonListComponent } from "../../visit-reasons/visit-reasons-list/table.component";



@Component({
  selector: "app-taxes-list",
  templateUrl: "./taxes-list.component.html",
  styleUrl: "./taxes-list.component.scss",
  standalone: true,
  imports: [SharedModule],
  providers: [MessageService],
})
export class TaxesListComponent {
  public routes = routes;
  searchDataValue = "";
  selectedTaxes = [];
  originalData: any = [];
  showDialog = false;
  modalData: any = {};
  taxID: any;
  taxesListData = [];
  cols = [];
  exportColumns = [];

  columnSettingWithItemsKeys = [
    { keys: "name", header: "Name" },
    { keys: "taxRate", header: "Tax Rate" },
  ];

  constructor(
    public dialog: MatDialog,
    private service: TaxesService,
    private messageService: MessageService,
    private readonly router: Router,
  ) {}

  openAddDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true; // Prevent closing with escape key
    const dialogRef = this.dialog.open(AddTaxesComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((dialog) => {
      if (dialog === true) return;
      this.service.CreateTax(dialog).subscribe((resp: any) => {
        if (resp.status === "success") {
          const message = "Tax has been added";
          this.messageService.add({ severity: "success", detail: message });
          this.getTaxesList();
        } else {
          const message = resp.message;
          this.messageService.add({ severity: "error", detail: message });
        }
      });
    });
  }
  handleNavigation(){
    this.openAddDialog();
  }
  handleDelete(Id: string){
    this.deletetaxes(Id)
  }
  handleEdit(Id: string){
    this.openEditDialog(Id);
  }
  openEditDialog(Id: string) {
    if (!Id) return;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true; // Prevent closing with escape key
    dialogConfig.data = Id; // Pass ID to the dialog

    const dialogRef = this.dialog.open(EditTaxesComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((dialog) => {
      if (dialog === true) return;
      dialog.id = Id;
      this.service.updateTaxById(dialog).subscribe((resp: any) => {
        if (resp.status === "success") {
          const message = "Tax Details has been updated";
          this.messageService.add({ severity: "success", detail: message });
          this.getTaxesList();
        } else {
          const message = resp.message;
          this.messageService.add({ severity: "error", detail: message });
        }
      });
    });
  }

  getTaxesList() {
    this.service.getAllTaxList().subscribe((resp: any) => {
      this.taxesListData = resp.data;
      this.originalData = resp.data;
      this.cols = [
        { field: "name", header: "Name" },
        { field: "taxRate", header: "Tax Rate" },
        { field: "createdOn", header: "Created On" },
      ];

      this.exportColumns = this.cols.map((col) => ({
        title: col.header,
        dataKey: col.field,
      }));
    });
  }

  ngOnInit(): void {
    this.getTaxesList();
  }

  deletetaxes(Id: any) {
    this.taxID = Id;
    this.modalData = {
      title: "Delete",
      messege: " Are you sure you want to delete this Tax",
    };
    this.showDialog = true;
  }

  showNewDialog() {
    this.showDialog = true;
  }

  callBackModal() {
    this.service.deleteTaxById(this.taxID).subscribe((resp) => {
      const message = "Tax has been deleted";
      this.messageService.add({ severity: "success", detail: message });
      this.getTaxesList();
      this.showDialog = false;
    });
  }

  close() {
    this.showDialog = false;
  }

  public searchData(value: any): void {
    this.taxesListData = this.originalData.filter((i) =>
      i.name.toLowerCase().includes(value.trim().toLowerCase())
    );
  }

  onPageChange(event) {
    const startIndex = event.first;
    const endIndex = startIndex + event.rows;
    const currentPageData = this.taxesListData.slice(startIndex, endIndex);
  }
}
