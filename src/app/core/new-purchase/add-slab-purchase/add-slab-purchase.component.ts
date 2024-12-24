import { ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { routes } from "src/app/shared/routes/routes";
import { SharedModule } from "src/app/shared/shared.module";
import { MessageService } from "primeng/api";
import { NewPurchaseService } from "src/app/core/new-purchase/new-purchase.service";
import { WarehouseService } from "src/app/core/settings/warehouse/warehouse.service";
import { atLeastOneRequiredValidator } from "src/app/core/validation";
import { blockProcessorService } from "src/app/core/block-processor/block-processor.service";
import { TaxesService } from "src/app/core/settings/taxes/taxes.service";
import { CategoriesService } from "src/app/core/settings/categories/categories.service";
import { SubCategoriesService } from "src/app/core/settings/sub-categories/sub-categories.service";
@Component({
  selector: "app-add-slab-purchase",
  standalone: true,
  imports: [SharedModule],
  providers: [MessageService],
  templateUrl: "./add-slab-purchase.component.html",
  styleUrl: "./add-slab-purchase.component.scss",
})
export class AddSlabPurchaseComponent {
  slabAddForm: FormGroup;
  public routes = routes;
  activeIndex: number;
  vehicleRegex = /^[A-Z]{2}[ -]?[0-9]{1,2}(?: ?[A-Z])?(?: ?[A-Z]*)? ?[0-9]{4}$/;
  wareHousedata: any[] = [];
  orderTaxList: any[] = [];
  taxesListData: any;
  categoryList: any[] = [];
  CategoryListsEditArray: any[] = [];
  allSubCategoryList: any[] = [];
  subCategorListByCategory: any[] = [];
  previouslotData: any;
  addvisible: any;
  slabDetails: any;
  maxPurchaseAmount: any;
  JSON = JSON;
  finishes = [
    { name: "Polished" },
    { name: "Unpolished" },
    { name: "Semi polished" },
  ];
  taxableAmount = false;
  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private cdRef: ChangeDetectorRef,
    private NewPurchaseService: NewPurchaseService,
    private WarehouseService: WarehouseService,
    private categoriesService: CategoriesService,
    private subCategoriesService: SubCategoriesService,
    private ServiceblockProcessor: blockProcessorService,
    private taxService: TaxesService
  ) {
    this.initForm();
  }

  private initForm(): void {
    this.slabAddForm = this.fb.group(
      {
        vehicleNo: ["", [Validators.pattern(this.vehicleRegex)]],
        warehouseDetails: ["", [Validators.required]],
        paidToSupplierSlabCost: [""],
        transportationCharge: ["", [Validators.min(0), Validators.max(100000)]],
        royaltyCharge: ["", [Validators.min(0), Validators.max(100000)]],
        totalCost: [""],
        taxableAmount: [""],
        slabDiscount: [""],
        taxable: [""],
        taxAmount: [""],
        costPerSQFT: [""],
        taxApplied: [""],
        nonTaxable: [""],
        totalSQFeet: [""],
        addSlab: this.fb.array([]),
      },
      { validators: atLeastOneRequiredValidator() }
    );
  }

  createSlabGroup(): FormGroup {
    return this.fb.group({
      slabName: ["", Validators.required],
      slabNumber: [""],
      width: [""],
      length: [""],
      thickness: [""],
      finishes: ["", Validators.required],
      subCategoryDetail: ["", Validators.required],
      categoryDetail: ["", Validators.required],
      numberOfPieces: ["", Validators.required],
      costPerSQFT: [""],
      quantity: [""],
      ratePerSqFeet: [""],
      totalAmount: [""],
    });
  }

  get addSlab(): FormArray {
    return this.slabAddForm.get("addSlab") as FormArray;
  }

  addNewSlab(): void {
    this.addSlab.push(this.createSlabGroup());
  }

  removeSlab(index: number): void {
    console.log("Removing index:", index);
    this.addSlab.removeAt(index);
    console.log("Updated array:", this.addSlab.value);
    this.slabAddFormSubmit();
    this.savaSlab();
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.setupFormSubscriptions();
    this.onBackButton();
  }

  private loadInitialData(): void {
    this.WarehouseService.getAllWarehouseList().subscribe((resp: any) => {
      this.wareHousedata = resp.data.map((element: any) => ({
        name: element.name,
        _id: {
          name: element.name,
          _id: element._id,
        },
      }));
    });

    this.loadCategories();
    this.loadSubCategories();
    this.loadTaxes();
  }

  private loadCategories(): void {
    this.categoriesService.getCategories().subscribe((resp: any) => {
      this.categoryList = resp.data;
      this.CategoryListsEditArray = this.categoryList.map((element) => ({
        name: element.name,
        _id: {
          _id: element._id,
          name: element.name,
        },
      }));
    });
  }

  private loadSubCategories(): void {
    this.subCategoriesService.getSubCategories().subscribe((resp: any) => {
      this.allSubCategoryList = resp.data;
      if (this.allSubCategoryList && this.previouslotData) {
        this.findSubCategory(this.previouslotData?.categoryDetail);
      }
    });
  }

  private loadTaxes(): void {
    this.taxService.getAllTaxList().subscribe((resp: any) => {
      this.taxesListData = resp.data;
      this.orderTaxList = this.taxesListData.map((element: any) => ({
        orderTaxName: `${element.name} (${element.taxRate}%)`,
        orderNamevalue: element,
      }));
    });
  }

  public setValidations(formControlName: string) {
    return (
      this.slabAddForm.get(formControlName)?.invalid &&
      (this.slabAddForm.get(formControlName)?.dirty ||
        this.slabAddForm.get(formControlName)?.touched)
    );
  }

  private setupFormSubscriptions(): void {
    this.slabAddForm.get("vehicleNo")?.valueChanges.subscribe((value) => {
      if (value) {
        const upperCaseValue = value.toUpperCase();
        this.slabAddForm
          .get("vehicleNo")
          ?.setValue(upperCaseValue, { emitEvent: false });
      }
    });
  }

  findSubCategory(category: any): void {
    if (category && this.allSubCategoryList) {
      this.subCategorListByCategory = this.allSubCategoryList.filter(
        (item: any) => item.categoryId._id === category._id
      );
    }
  }

  public addSlabDialog() {
    this.addNewSlab();
    this.activeIndex =
      (this.slabAddForm.get("addSlab") as FormArray).length - 1;
    this.cdRef.detectChanges();
    this.addvisible = true;
  }

  public savaSlab() {
    this.addvisible = false;
    this.slabDetails = this.ifAnyObjectIsempty(
      this.slabAddForm.get("addSlab").value
    );
    console.log(this.slabDetails);
    this.slabAddForm.patchValue(this.slabDetails);
    console.log(this.slabDetails, "slabDetails");
    this.slabAddFormSubmit();
  }

  onDialogHide(): void {
    this.slabDetails = this.ifAnyObjectIsempty(
      this.slabAddForm.get("addSlab").value
    );
    console.log(this.slabDetails);
    this.slabAddForm.patchValue(this.slabDetails);
    this.slabAddFormSubmit();
  }

  slabTotalAmount() {
    this.slabAddForm.get("addSlab").value.forEach((items, index) => {
      let quantity = items.quantity || 0;
      let ratePerSqFeet: number = items.ratePerSqFeet || 0;
      let totalAmount = 0;
      totalAmount = quantity * ratePerSqFeet;
      (this.slabAddForm.get("addSlab") as FormArray)
        .at(index)
        .get("totalAmount")
        ?.setValue(totalAmount);
      if (
        (this.slabAddForm.get("addSlab") as FormArray)
          .at(index)
          .get("totalAmount").value > 0
      ) {
        this.allSlabtotalAmount();
      }
    });
  }

  allSlabtotalAmount() {
    let allSlabtotalAmount = 0;
    let quantitySF = 0;
    this.slabAddForm.get("addSlab").value.forEach((items, index) => {
      let totalAmount = items.totalAmount || 0;
      let quantity = items.quantity || 0;
      allSlabtotalAmount += totalAmount;
      quantitySF += quantity;
      this.slabAddForm.get("totalCost")?.setValue(allSlabtotalAmount);
      this.slabAddForm.get("paidToSupplierSlabCost")?.setValue(allSlabtotalAmount);
      this.slabAddForm.get("nonTaxable")?.setValue(allSlabtotalAmount);
      this.slabAddForm.get("totalSQFeet")?.setValue(quantitySF);
    });
  }

  calculateTotalAmount(type?: string) {
    let totalTaxAmount = 0;
    let tatalPurchaseCost = 0;
    let taxApplied = this.slabAddForm.get("taxApplied")?.value || 0;
    let nonTaxable = this.slabAddForm.get("nonTaxable")?.value || 0;
    let taxableAmount = this.slabAddForm.get("taxableAmount")?.value || 0;
    let totalSQFeet = this.slabAddForm.get("totalSQFeet")?.value || 0;
    let transportationCharge =
      this.slabAddForm.get("transportationCharge")?.value || 0;
    let royaltyCharge = this.slabAddForm.get("royaltyCharge")?.value || 0;
    let slabDiscount = this.slabAddForm.get("slabDiscount")?.value || 0;
    let paidToSupplierSlabCost =
      this.slabAddForm.get("paidToSupplierSlabCost")?.value || 0;
    let totalCost = this.slabAddForm.get("totalCost")?.value || 0;

    if (type == 'tax' && (taxableAmount || nonTaxable)) {
      this.fixTaxAmount();
    }

    taxableAmount = this.slabAddForm.get("taxableAmount")?.value || 0;
    nonTaxable = this.slabAddForm.get("nonTaxable")?.value || 0;

    if (Array.isArray(taxApplied) && taxableAmount) {
      taxApplied.forEach((selectedTax: any) => {
        totalTaxAmount += (taxableAmount * selectedTax?.taxRate) / 100;
      });
      this.slabAddForm.get("taxableAmount")?.setValue(this.slabAddForm.get("taxableAmount")?.value + totalTaxAmount);
      this.slabAddForm.get("taxAmount")?.setValue(totalTaxAmount || null);
    }
    tatalPurchaseCost =
      +taxableAmount +
      totalTaxAmount +
      transportationCharge +
      royaltyCharge +
      nonTaxable;
    this.slabAddForm.get("totalCost")?.setValue(tatalPurchaseCost);
    this.discount(slabDiscount, tatalPurchaseCost);
    this.calculateCostPerSQ(transportationCharge, royaltyCharge, totalSQFeet, totalTaxAmount, totalCost);
  }

  private fixTaxAmount() {
    let taxableAmount = this.slabAddForm.get("taxableAmount")?.value || 0;
    let nonTaxable = this.slabAddForm.get("nonTaxable")?.value || 0;
    let paidToSupplierSlabCost =
      this.slabAddForm.get("paidToSupplierSlabCost")?.value || 0;
    if (taxableAmount) {
      if (taxableAmount > nonTaxable) {
        this.taxableAmount = true;
      } else {
        this.taxableAmount = false;
        this.slabAddForm
          .get("nonTaxable")
          ?.setValue(nonTaxable - taxableAmount);
      }
    } else if (taxableAmount === 0 || nonTaxable === 0) {
      this.slabAddForm.get("nonTaxable")?.setValue(paidToSupplierSlabCost);
    }
  }

  private calculateCostPerSQ(transportationCharge: number, royaltyCharge: number, totalSQFeet: number, totalTaxAmount: number, totalCost: number) {
    let totalChargeWithTotalSQFeet = 0;
    let totalCharge = 0;
    let taxAmountRup = 0;
    let taxAmountSQFeet = 0;
    let costPerSQFT = 0;
    this.slabAddForm.get("addSlab").value.forEach((items, index) => {
      totalChargeWithTotalSQFeet = transportationCharge + royaltyCharge / totalSQFeet; // (10,000 + 5000 = 15000 / 2500) = 6  
      totalCharge = totalTaxAmount / totalCost; // (9000 / 160000) = 0.05625;
      taxAmountRup = totalCharge * items.totalAmount; // 3,093.75, 5,906.25
      taxAmountSQFeet = taxAmountRup * items.quantity; // 3.09375, 3.9375
      costPerSQFT = items.ratePerSqFeet + totalChargeWithTotalSQFeet + taxAmountSQFeet; // 64.09375 , 79.9375
    })
    this.slabAddForm.get("costPerSQFT")?.setValue(costPerSQFT);
  }

  private discount(slabDiscount?: number, totalCosting?: number) {
    this.slabAddForm
      .get("paidToSupplierSlabCost")
      ?.setValue(totalCosting - slabDiscount);
  }

  slabAddFormSubmit() {
    const values = this.slabAddForm.value;
    values.addSlab = this.ifAnyObjectIsempty(values.addSlab);
    localStorage.setItem("slabAddForm", JSON.stringify(values));
  }
  onBackButton() {
    if (localStorage.getItem("slabAddForm")) {
      const slabDetails = JSON.parse(localStorage.getItem("slabAddForm"));
      this.slabAddForm.patchValue({
        warehouseDetails: slabDetails?.warehouseDetails,
        vehicleNo: slabDetails.vehicleNo,
        transportationCharge: slabDetails.transportationCharge,
        royaltyCharge: slabDetails.royaltyCharge,
        slabDiscount: slabDetails.slabDiscount,
        paidToSupplierSlabCost: slabDetails.paidToSupplierSlabCost,
        totalCost: slabDetails.totalCost,
        nonTaxable: slabDetails.nonTaxable,
        taxableAmount: slabDetails.taxableAmount,
        taxApplied: slabDetails.taxApplied,
      });
      this.addSlab.clear();
      slabDetails.addSlab.forEach((slab: any) => {
        const slabGroup = this.createSlabGroup(); // Create a new FormGroup for each slab
        slabGroup.patchValue(slab); // Patch the data into the group
        this.addSlab.push(slabGroup); // Add the group to the FormArray
      });
      this.savaSlab();
    }
  }
  ngOnDestroy(): void {
    window.onbeforeunload = null;
  }

  private ifAnyObjectIsempty(addSlab: any): any {
    console.log(addSlab);

    if (Array.isArray(addSlab)) {
      addSlab = addSlab.filter((item) => {
        return (
          item.subCategoryDetail !== "" &&
          item.categoryDetail !== "" &&
          item.finishes !== "" &&
          item.numberOfPieces !== ""
        );
      });
    }
    console.log(addSlab);
    return addSlab;
  }
}
