import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { ToastModule } from "primeng/toast";
import { routes } from "src/app/shared/routes/routes";
import { SharedModule } from "src/app/shared/shared.module";
import { LotService } from "../../lot/lot.service";
import { WarehouseService } from "src/app/core/settings/warehouse/warehouse.service";
import { SlabsService } from "../../slabs/slabs.service";
import { blockProcessorService } from "src/app/core/block-processor/block-processor.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { validationRegex } from "src/app/core/validation";
import { BlocksService } from "../blocks.service";

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}

interface ExportColumn {
  title: string;
  dataKey: string;
}

@Component({
  selector: "app-list-blocks",
  standalone: true,
  imports: [CommonModule, SharedModule, ButtonModule, ToastModule],
  providers: [MessageService],
  templateUrl: "./list-blocks.component.html",
  styleUrl: "./list-blocks.component.scss",
})
export class ListBlocksComponent implements OnInit {
  public routes = routes;
  createBlockSplitForm!: FormGroup;
  editBlockSplitForm!: FormGroup;
  data: any[] = [];
  originalData: any[] = [];
  public showDialog = false;
  modalData: any = {};
  blocksID: string;
  searchDataValue = "";
  selectedBlocks: any[] = [];
  allInDropDown: any[];
  warehouseDropDown: any;
  warehouseData: any[];
  cols: Column[] = [];
  blockProcessorList: any[] = [];
  lotID: string;
  exportColumns: ExportColumn[] = [];
  visibleBlockSplit: boolean = false
  visibleEditBlockSplit: boolean = false

  constructor(
    public dialog: MatDialog,
    public router: Router,
    private lotService: LotService,
    private slabsService: SlabsService,
    private blockProcessorService: blockProcessorService,
    private messageService: MessageService,
    private warehouseService: WarehouseService,
    private fb: FormBuilder,
    private blocksService: BlocksService,
  ) {
    this.createBlockSplitForm = this.fb.group({
      lotId: [''],
      lotNo: [''],
      warehouseDetails: [''],
      existblockDetails: [''],
      blockNo: ['', [Validators.required, Validators.pattern(validationRegex.oneToFiftyCharRegex)]],
      length: ['', [Validators.required, Validators.min(1), Validators.max(500)]],
      width: ['', [Validators.required, Validators.min(1), Validators.max(500)]],
      height: ['', [Validators.required, Validators.min(1), Validators.max(500)]],
      totalArea: ['', [Validators.required, Validators.min(1), Validators.max(125000000)]],
      weightPerBlock: [''],
      rawCosting: [''],
      transportationCosting: [''],
      royaltyCosting: [''],
      taxAmountCosting: [''],
      totalCosting: [''],
      blockProcessor: ['']
    });
    this.editBlockSplitForm = this.fb.group({
      lotId: [''],
      lotNo: [''],
      warehouseDetails: [''],
      existblockDetails: [''],
      blockNo: ['', [Validators.required, Validators.pattern(validationRegex.oneToFiftyCharRegex)]],
      length: ['', [Validators.required, Validators.min(1), Validators.max(500)]],
      width: ['', [Validators.required, Validators.min(1), Validators.max(500)]],
      height: ['', [Validators.required, Validators.min(1), Validators.max(500)]],
      totalArea: ['', [Validators.required, Validators.min(1), Validators.max(125000000)]],
      weightPerBlock: [''],
      rawCosting: [''],
      transportationCosting: [''],
      royaltyCosting: [''],
      taxAmountCosting: [''],
      totalCosting: [''],
      blockProcessor: ['']
    });
  }

  ngOnInit(): void {
    this.getUnProcessedList();
    this.getWarehouseList();
    this.getBlockProcessorList();
  }

  onFilter(value: any): void {
    console.log(value);
    this.data = value.filteredValue;
    console.log(value.filteredValue);
  }

  getUnProcessedList(): void {
    this.lotService.getUnProcessedList().subscribe((resp: any) => {
      this.data = resp.data;
      this.originalData = resp.data;
      this.lotID = resp.data.lotId;
      if (this.data.some(block => block.blockProcessor)) {
        const blockWithProcessor = this.data.find(block => block.blockProcessor);
        if (blockWithProcessor) {
          this.lotID = blockWithProcessor.lotId;
          blockWithProcessor.blockProcessor = blockWithProcessor.blockProcessor;
        }
      }
      console.log("API", this.data);
      this.cols = [

        { field: "date", header: "Date" },
        { field: "blockDetails.blockNo", header: "Block Number" },
        { field: "category", header: "Category" },
        { field: "subCategory", header: "Sub Category" },
        { field: "blockDetails.height", header: "Height" },
        { field: "blockDetails.width", header: "Width" },
        { field: "blockDetails.length", header: "Length" },
        { field: "blockDetails.totalArea", header: "Total Area" },
        { field: "lotTotalCosting", header: "Total Cost" },
        { field: "warehouseDetails.name", header: "Warehouse" },
        { field: "lotNo", header: "Lot Number" },
        { field: "lotName", header: "Lot Name" },
        { field: "blockProcessorList", header: "Processor" }
      ];

      this.exportColumns = this.cols.map((col) => ({
        title: col.header,
        dataKey: col.field,
      }));
    });
  }

  getWarehouseList(): void {
    this.warehouseService.getAllWarehouseList().subscribe((resp: any) => {
      this.warehouseData = resp.data.map((element) => ({
        name: element.name,
        _id: {
          _id: element._id,
          name: element.name,
        },
      }));
    });
  }

  getBlockProcessorList(): void {
    this.blockProcessorService.getAllBlockProcessorData().subscribe((data: any) => {
      this.blockProcessorList = data.map((element: any) => ({
        name: element.name,
        _id: {
          _id: element._id,
          name: element.name,
        },
      }));
      console.log(this.blockProcessorList);
    });
  }

  onBlockProcessorChange(event: any, blockNo: string, lotId: string): void {
    console.log("block processor", event.value);
    const payload = {
      lotId: lotId,
      blockNo: blockNo,
      blockProcessor: event.value,
    };
    this.slabsService.updateBlockProcessorByLotId(payload).subscribe(
      (resp: any) => {
        if (resp) {
          this.messageService.add({
            severity: resp.status === "success" ? "success" : "error",
            detail: resp.message,
          });
          this.getUnProcessedList();
        }
      }
    );
  }

  close(): void {
    this.showDialog = false;
  }

  onPageChange(event: any): void {
    const startIndex = event.first;
    const endIndex = startIndex + event.rows;
    const currentPageData = this.data.slice(startIndex, endIndex);
  }

  onSearchByChange(value: any): void {
    if (value == null) {
      this.data = this.originalData;
    } else {
      this.data = this.originalData.filter((i) => i.warehouseDetails && i.warehouseDetails._id === value._id);
      this.allInDropDown = this.data;
    }
    console.log(this.data);
  }

  searchData(): void {
    if (this.searchDataValue === "") {
      this.onSearchByChange(null);
      console.log(this.warehouseDropDown);
      if (this.warehouseDropDown.name === "") {
        this.data = this.originalData;
      }
      this.data = this.allInDropDown;
    }
  }

  visibleBlockSplitPopUp(value: any) {
    console.log(value);
    this.createBlockSplitForm.reset();
    this.createBlockSplitForm.patchValue({
      lotId: value?.lotId,
      lotNo: value?.lotNo,
      warehouseDetails: value?.warehouseDetails,
      existblockDetails: {
        blockNo: value?.blockDetails?.blockNo,
        length: value?.blockDetails?.length,
        width: value?.blockDetails?.width,
        height: value?.blockDetails?.height,
        totalArea: value?.blockDetails?.totalArea,
      },
    });
    this.visibleBlockSplit = true;
  }
  visibleEditBlockSplitPopUp(value: any) {
    console.log('value', value);

    const payload = {
      lotId: value?.lotId,
      blockNo: value?.blockDetails?.splitedFrom,
    }
    this.blocksService.getSplittedBlockByLotId(payload).subscribe((resp: any) => {
      if (resp) {
        this.editBlockSplitForm.reset();
        this.editBlockSplitForm.patchValue({
          lotId: value?.lotId,
          lotNo: value?.lotNo,
          warehouseDetails: value?.warehouseDetails,
          existblockDetails: {
            blockNo: value?.blockDetails?.blockNo,
            length: value?.blockDetails?.length,
            width: value?.blockDetails?.width,
            height: value?.blockDetails?.height,
            totalArea: value?.blockDetails?.totalArea,
          },
          blockNo: resp.data[0].blockDetails.blockNo,
          length: resp.data[0].blockDetails.length,
          width: resp.data[0].blockDetails.width,
          height: resp.data[0].blockDetails.height,
          totalArea: resp.data[0].blockDetails.totalArea,
          blockProcessor: resp.data[0].blockDetails.blockProcessor,
        });
        this.visibleEditBlockSplit = true;
      }
    });
    console.log(value);
  }

  getblockDetails(type) {
    if(type == 'createSplitBlock'){
      let height = this.createBlockSplitForm.get("height").value;
      let width = this.createBlockSplitForm.get("width").value;
      let length = this.createBlockSplitForm.get("length").value;
      let totalArea = height * width * length;
      this.createBlockSplitForm.get("totalArea").setValue(totalArea);
    } else{
      let height = this.editBlockSplitForm.get("height").value;
      let width = this.editBlockSplitForm.get("width").value;
      let length = this.editBlockSplitForm.get("length").value;
      let totalArea = height * width * length;
      this.editBlockSplitForm.get("totalArea").setValue(totalArea);
    }
  }


  createBlockSplitFormSubmit() {
    if (this.createBlockSplitForm.valid) {
      const formData = this.createBlockSplitForm.value;
      const payload = {
        lotId: formData?.lotId,
        blockNo: formData?.existblockDetails?.blockNo,
        newBlockDetails: {
          blockNo: formData?.blockNo,
          length: formData?.length,
          width: formData?.width,
          height: formData?.height,
          totalArea: formData?.totalArea,
          blockProcessor: formData?.blockProcessor,
        },
      }


      this.blocksService.splitBlock(payload).subscribe((resp: any) => {
        if (resp) {
          if (resp.status === "success") {
            this.messageService.add({ severity: "success", detail: resp.message });
            this.visibleBlockSplit = false;
            this.getUnProcessedList();
          } else {
            const message = resp.message;
            this.messageService.add({ severity: "error", detail: message });
          }
        }

      })
    }
  }

  editBlockSplitFormSubmit(){
    if (this.editBlockSplitForm.valid) {
      const formData = this.editBlockSplitForm.value;
      const payload = {
        lotId: formData?.lotId,
        blockNo: formData?.blockNo,
        updatedBlockDetails: {
          length: formData?.length,
          width: formData?.width,
          height: formData?.height,
          // totalArea: formData?.totalArea,
          blockProcessor: formData?.blockProcessor,
        },
      }

      this.blocksService.updateSplitedBlock(payload).subscribe((resp: any) => {
        if (resp) {
          if (resp.status === "success") {
            this.messageService.add({ severity: "success", detail: resp.message });
            this.visibleEditBlockSplit = false;
            this.getUnProcessedList();
          } else {
            const message = resp.message;
            this.messageService.add({ severity: "error", detail: message });
          }
        }

      })
    }
  }
  deleteBlockSplit(){
    console.log('this',this.editBlockSplitForm.value);
    const payload = {
      lotId : this.editBlockSplitForm.value.lotId,
      blockNo: this.editBlockSplitForm.value.blockNo,
    }
    this.blocksService.deleteSplitedBlock(payload).subscribe((resp:any) => {
      if (resp) {
        if (resp.status === "success") {
          this.messageService.add({ severity: "success", detail: resp.message });
          this.visibleEditBlockSplit = false;
          this.getUnProcessedList();
        } else {
          const message = resp.message;
          this.messageService.add({ severity: "error", detail: message });
        }
      }
    });
  }
}
