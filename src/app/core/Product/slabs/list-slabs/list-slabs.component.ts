import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { ToastModule } from "primeng/toast";
import { routes } from "src/app/shared/routes/routes";
import { SharedModule } from "src/app/shared/shared.module";
import { SlabsService } from "../slabs.service";
import { DialogModule } from "primeng/dialog";
import { WarehouseService } from "src/app/core/settings/warehouse/warehouse.service";
@Component({
  selector: "app-list-slabs",
  standalone: true,
  imports: [SharedModule],
  providers: [MessageService],
  templateUrl: "./list-slabs.component.html",
  styleUrl: "./list-slabs.component.scss",
})
export class ListSlabsComponent {
  public routes = routes;
  data: any = null;
  originalData: any = [];
  public showDialog: boolean = false;
  public slabVisible: boolean = false;
  slabDetail: any = {};
  modalData: any = {};
  slabsID: any;
  searchDataValue = "";
  selectedSlabs = [];
  allSlabsDaTa: any;
  slabsDaTa = "slabsDaTa";
  slabProfit: number = 0;
  slabHistoryData: any=[];
  visibleSlabHistory: boolean = false;
  warehouseData: any;
  warehouseDropDown: any;
  allInDropDown: any;

  constructor(
    public dialog: MatDialog,
    public router: Router,
    private service: SlabsService,
    private _snackBar: MatSnackBar,
    private messageService: MessageService,
    private WarehouseService: WarehouseService
  ) {}

  getSlabsList(): void {
    this.service.getSlabsList().subscribe((resp: any) => {
      this.allSlabsDaTa = resp.data;
      this.originalData = resp.data;
      console.log("API", this.allSlabsDaTa);
    });
  }
  showSlabDetails(_id: any) {
    this.slabProfit = 0;
    this.slabVisible = true;
    this.slabDetail = this.allSlabsDaTa.find((e) => e._id === _id);
    this.slabProfit =
      this.slabDetail?.totalSales - this.slabDetail?.totalSalesReturn;
  }

  showSlabHistoryDetails(_id) {
    this.service.getSlabHistoryById(_id).subscribe((resp: any) => {
      this.visibleSlabHistory = true;
      this.slabHistoryData = resp.data;
      this.originalData = resp.data;
      console.log("Slab History API", this.slabHistoryData);
    });
  }
  ngOnInit(): void {
    this.getSlabsList();
    this.WarehouseService.getAllWarehouseList().subscribe((resp: any) => {
      this.warehouseData = resp.data.map((element) => ({
        name: element.name,
        _id: {
          _id: element._id,
          name: element.name,
        },
      }));
      console.log(this.warehouseData);
    });
  }

  onFilter(value: any) {
    this.allSlabsDaTa = value.filteredValue;
  }

  deleteSlabs(_id: any) {
    this.slabsID = _id;

    this.modalData = {
      title: "Delete",
      messege: "Are you sure want to delete this Slabs",
    };
    this.showDialog = true;
  }

  showNewDialog() {
    this.showDialog = true;
  }

  onSearchByChange(value: any): void {
    // if(this.searchDataValue  == ''){
    //   return this.allSlabsDaTa = this.originalData;
    // }
    console.log("value asyock adjustment", value);
    if (value == null) {
      return (this.allSlabsDaTa = this.originalData);
    } else {
      this.allSlabsDaTa = this.originalData.map((i) => {
        console.log(i);
        if (i.warehouseDetails._id === value._id) {
          return i;
        }
      });
      this.allInDropDown = this.allSlabsDaTa
    }
  }

  callBackModal() {
    this.service.deleteSlabsById(this.slabsID).subscribe((resp) => {
      const message = "Slabs has been deleted";
      this.messageService.add({ severity: "success", detail: message });
      this.getSlabsList();
      this.showDialog = false;
    });
  }
  updateSlabs(id: any) {
    this.router.navigate(["/slabs/slab-edit/" + id]);
  }

  close() {
    this.showDialog = false;
  }

  searchData() {
    if (this.searchDataValue == "") {
      this.onSearchByChange(null)
      console.log(this.warehouseDropDown);
      if(this.warehouseDropDown.name == '' ){
        this.allSlabsDaTa = this.originalData
      }
      return (this.allSlabsDaTa = this.allInDropDown);
    }
  }
  onPageChange(event) {
    const startIndex = event.first;
    const endIndex = startIndex + event.rows;
    const currentPageData = this.allSlabsDaTa.slice(startIndex, endIndex);
  }
}
