import { Component, OnInit } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { TreeTableModule } from 'primeng/treetable';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { routes } from 'src/app/shared/routes/routes';
import { SharedModule } from 'src/app/shared/shared.module';
import { LotService } from '../../lot/lot.service';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { SlabsService } from '../../slabs/slabs.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { WarehouseAddComponent } from 'src/app/core/settings/warehouse/warehouse-add/warehouse-add.component';
import { WarehouseService } from 'src/app/core/settings/warehouse/warehouse.service';
import { DropdownModule } from 'primeng/dropdown';
import { Validators } from '@angular/forms';
import { StockTransferService } from '../stock-transfer.service';
import { FilterPipe } from 'src/app/core/filter.pipe';

@Component({

  selector: 'app-stock-transfer-list',
  templateUrl: './stock-transfer-list.component.html',
  styleUrl: './stock-transfer-list.component.scss',
  standalone: true,
  imports: [CommonModule, SharedModule, ButtonModule, TableModule, TreeTableModule, ToastModule, DialogModule, DropdownModule,FilterPipe],
  providers: [MessageService],
})
export class StockTransferListComponent implements OnInit {
  addStockTransferForm: FormGroup;
  editStockTransferForm: FormGroup;
  public routes = routes;
  stockTransferDataList: any = [];
  originalData: any = []
  public showDialog: boolean = false;
  public addstockTransfer: boolean = false;
  public editStockTransfer: boolean = false;
  modalData: any = {}
  stockTransferId: any;
  searchDataValue = "";
  selectedlot = "";
  showData: any;
  warehouseData: any = []
  slabData: any = []
  transferType: any = [
    { name: "All Quantity", value: "All Quantity" },
    { name: "Custom Quantity", value: "Custom Quantity" }
  ]

  constructor(public router: Router,
    private service: StockTransferService,
    private SlabsService: SlabsService,
    private WarehouseService: WarehouseService,
    private fb: FormBuilder,
    private messageService: MessageService) {
    this.addStockTransferForm = this.fb.group({
      fromWarehouse: [""],
      toWarehouse: [""],
      slab: ["", [Validators.required]],
      transferType: [""],
      currentQty: ["",],
      transferQty: ["", [Validators.required]],
      transportCharges: [""],
      otherCharges: [""],
    });
    this.editStockTransferForm = this.fb.group({
      fromWarehouse: [""],
      toWarehouse: [""],
      slab: ["", [Validators.required]],
      transferType: [""],
      currentQty: ["",],
      transferQty: ["", [Validators.required]],
      transportCharges: [""],
      otherCharges: [""],
    });
  }

  getStockTransferList(): void {
    this.service.getStockTransferList().subscribe((resp: any) => {
      this.stockTransferDataList = resp.data;
      this.originalData = resp.data;

    });
  }

  ngOnInit(): void {
    this.getStockTransferList();
    this.WarehouseService.getAllWarehouseList().subscribe((resp: any) => {
      this.warehouseData = resp.data.map(element => ({
        name: element.name,
        _id: {
          _id: element._id,
          name: element.name
        }
      }));
    });
  }

  onWarehouseSelect(value: any) {
    this.SlabsService.getSlabListByWarehouseId(value._id).subscribe((resp: any) => {
      this.slabData = resp.data.map(element => ({
        name: element.slabName,
        _id: {
          _id: element._id,
          slabName: element.slabName,
          slabNo: element.slabNo,
          totalSQFT: element.totalSQFT,
        },
      }));
    });
  }
  settotalSQFT(value: any) {
    this.addStockTransferForm.get("currentQty").setValue(value.totalSQFT)
  }
  editSettotalSQFT(value: any) {
    this.editStockTransferForm.get("currentQty").setValue(value.totalSQFT)
  }
  onTrasferTypeSelect(value: any){
    if(value === 'All Quantity'){
      this.addStockTransferForm.get('transferQty').setValue(this.addStockTransferForm.get('currentQty').value);
      this.editStockTransferForm.get('transferQty').setValue(this.editStockTransferForm.get('currentQty').value);
  } else {
      this.addStockTransferForm.get('transferQty').reset();
      this.editStockTransferForm.get('transferQty').reset();
  }
  }

  addstockTransferDialog() {
    this.addStockTransferForm.reset();
    this.addstockTransfer = true;
  }
  editstockTransferDialog(_id: any) {
    this.stockTransferId = _id;
    this.service.getStockTransferById(_id).subscribe((resp:any) => {
      this.editSettotalSQFT(resp.data.slab)
      this.editStockTransferForm.patchValue({
      fromWarehouse: resp.data.fromWarehouse,
      toWarehouse: resp.data.toWarehouse,
      slab: resp.data.slab,
      transferType: resp.data.transferType,
      transferQty: resp.data.transferQty,
      transportCharges: resp.data.transportCharges,
      otherCharges: resp.data.otherCharges,
      })
    })
    this.editStockTransfer = true;
  }



  deleteStockTransfer(_id: any) {
    this.stockTransferId = _id;
    this.modalData = {
      title: "Delete",
      messege: "Are you sure want to delete this Stock Transfer?",
    }
    this.showDialog = true;
  }

  showNewDialog() {
    this.showDialog = true;
  }

  callBackModal() {
    this.service.deleteStockTransfer(this.stockTransferId).subscribe(resp => {
      const message = "Stock Transfer has been deleted"
      this.messageService.add({ severity: 'success', detail: message });
      this.getStockTransferList();
      this.showDialog = false;
    });
  }

  close() {
    this.showDialog = false;
  }

  addStockTransferFormSubmit() {
    if(this.addStockTransferForm.value.fromWarehouse === this.addStockTransferForm.value.toWarehouse){
      const message = "From-Warehouse and To-Warehouse cannot be the same.";
      this.messageService.add({ severity: "error", detail: message });
    }
    else if(this.addStockTransferForm.value.transferQty > this.addStockTransferForm.value.currentQty){
      const message = "Transfer Quantity Can not be more then Current Quantity.";
      this.messageService.add({ severity: "error", detail: message });
    } else{
    const payload = {
      fromWarehouse: this.addStockTransferForm.value.fromWarehouse,
      toWarehouse: this.addStockTransferForm.value.toWarehouse,
      slab: this.addStockTransferForm.value.slab,
      transferType: this.addStockTransferForm.value.transferType,
      transferQty: this.addStockTransferForm.value.transferQty,
      transportCharges: this.addStockTransferForm.value.transportCharges,
      otherCharges: this.addStockTransferForm.value.otherCharges,
    }
    if (this.addStockTransferForm.valid) {
      this.service.addStockTransfer(payload).subscribe((resp: any) => {
        if (resp.status === "success") {
          this.addstockTransfer = false;
          const message = "Stock Transfer has been added";
          this.messageService.add({ severity: "success", detail: message });
          this.getStockTransferList();
        } else {
          this.messageService.add({ severity: "error", detail: resp.message });
        }
      });
    } else {
      console.log("Form is invalid!");
    }
  }
  }
  editStockTransferFormSubmit() {
    
    const payload = {
      id: this.stockTransferId,
      fromWarehouse: this.editStockTransferForm.value.fromWarehouse,
      toWarehouse: this.editStockTransferForm.value.toWarehouse,
      slab: this.editStockTransferForm.value.slab,
      transferType: this.editStockTransferForm.value.transferType,
      transferQty: this.editStockTransferForm.value.transferQty,
      transportCharges: this.editStockTransferForm.value.transportCharges,
      otherCharges: this.editStockTransferForm.value.otherCharges,
    }
    if (this.editStockTransferForm.valid) {
      this.service.updateStockTransfer(payload).subscribe((resp: any) => {
        if (resp.status === "success") {
          this.editStockTransfer = false;
          const message = "Stock Transfer has been updated";
          this.messageService.add({ severity: "success", detail: message });
          this.getStockTransferList();
        } else {
          const message = resp.message;
          this.messageService.add({ severity: "error", detail: message });
        }
      });
    } else {
      console.log("Form is invalid!");
    }
  }

  public searchData(value: any): void {
    this.stockTransferDataList = this.originalData.filter(i =>
      i.slab.slabName.toLowerCase().includes(value.trim().toLowerCase())
    );
  }
  onPageChange(event) {
    const startIndex = event.first;
    const endIndex = startIndex + event.rows;
    const currentPageData = this.stockTransferDataList.slice(startIndex, endIndex);
  }
}


