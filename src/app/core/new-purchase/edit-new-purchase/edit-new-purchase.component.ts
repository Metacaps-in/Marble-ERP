import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { routes } from "src/app/shared/routes/routes";
import { MessageService } from "primeng/api";
import { LocalStorageService } from "src/app/shared/data/local-storage.service";
import { WarehouseService } from "../../settings/warehouse/warehouse.service";
import { CategoriesService } from "../../settings/categories/categories.service";
import { SuppliersdataService } from "../../Suppliers/suppliers.service";
import { SubCategoriesService } from "../../settings/sub-categories/sub-categories.service";
import { NewPurchaseService } from "../new-purchase.service";
import { TaxesService } from "../../settings/taxes/taxes.service";
import { TaxVendorsService } from "../../tax-vendors/tax-vendors.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { validationRegex } from "../../validation";
import { SharedModule } from "src/app/shared/shared.module";
import { AddSlabsComponent } from "../../Product/slabs/add-slabs/add-slabs.component";
import { EditLotComponent } from "../../Product/lot/edit-lot/edit-lot.component";

@Component({
  selector: "app-edit-new-purchase",
  standalone: true,
  imports: [SharedModule, EditLotComponent, AddSlabsComponent],
  templateUrl: "./edit-new-purchase.component.html",
  styleUrl: "./edit-new-purchase.component.scss",
})
export class EditNewPurchaseComponent implements OnInit {
  @ViewChild(EditLotComponent) child!: EditLotComponent;
  public routes = routes;
  maxDate = new Date();
  lotsNoArray = [
    { name: "Lot", _id: "lot" },
    { name: "Slab", _id: "slab" },
  ];
  finishes = [
    { name: "Polished" },
    { name: "Unpolished" },
    { name: "Semi polished" },
  ];
  currentUrl: string;
  editNewPurchaseForm!: FormGroup;
  invoiceRegex = /^(?=[^\s])([a-zA-Z\d\/\-_ ]{1,30})$/;
  shortNameRegex = /^[^\s.-][a-zA-Z0-9_.\s-]{2,50}$/;
  descriptionRegex = /^.{3,500}$/s;
  purchaseId: "";
  taxVendorList: any = [];
  wareHousedata: any = [];
  wareHousedataListsEditArray: any = [];
  getSupplierShow: any;
  SupplierLists: any = [];
  taxesListData: any = [];
  orderTaxList: any = [];
  categoryList: any = [];
  CategoryListsEditArray: any = [];
  subCategoryList: any = [];
  SubCategoryListsEditArray: any = [];
  subCategorListByCategory: any = [];
  lotTypeValue: any;
  ItemDetails: any = {};
  LotPayload: any;
  previousSlabValues: any = {};
  returnUrl: string;
  apiResponseData: any; x
  purchaseData: any;
  constructor(
    private activeRoute: ActivatedRoute,
    private changeDetector: ChangeDetectorRef,
    private router: Router,
    private fb: FormBuilder,
    private WarehouseService: WarehouseService,
    private categoriesService: CategoriesService,
    private SuppliersdataService: SuppliersdataService,
    private subCategoriesService: SubCategoriesService,
    private NewPurchaseService: NewPurchaseService,
    private messageService: MessageService,
    private localStorageService: LocalStorageService,
    private taxService: TaxesService,
    private taxVendorsService: TaxVendorsService
  ) {
    this.editNewPurchaseForm = this.fb.group({
      invoiceNumber: ["", [Validators.pattern(this.invoiceRegex)]],
      purchaseDate: ["", Validators.required],
      supplier: ["", [Validators.required]],
      paidToSupplierPurchaseCost: [
        "",
        [Validators.min(0), Validators.max(9999999), Validators.required],
      ],
      purchaseType: ["", [Validators.required]],

      purchaseNotes: [
        "",
        [Validators.pattern(validationRegex.address3To500Regex)],
      ],
      _id: [""],
      productId: [""],
      slabNo: [
        "",
        [Validators.required, Validators.pattern(this.invoiceRegex)],
      ],
      slabName: [
        "",
        [Validators.required, Validators.pattern(this.invoiceRegex)],
      ],
      warehouseDetails: ["", [Validators.required]],
      categoryDetail: ["", [Validators.required]],
      subCategoryDetail: ["", [Validators.required]],
      totalSQFT: [
        "",
        [Validators.required, Validators.min(1), Validators.max(100000)],
      ],
      width: ["", [Validators.min(1), Validators.max(100000)]],
      length: ["", [Validators.min(1), Validators.max(100000)]],
      thickness: ["", [Validators.min(1), Validators.max(1000)]],
      finishes: ["", [Validators.required]],
      sellingPricePerSQFT: [
        "",
        [Validators.min(1), Validators.max(100000)],
      ],
      transportationCharges: ["", [Validators.min(1), Validators.max(100000)]],
      otherCharges: ["", [Validators.min(1), Validators.max(100000)]],
      totalCosting: [""],
      costPerSQFT: [""],
      sqftPerPiece: [""],
      noOfPieces: [
        "",
        [Validators.required, Validators.min(1), Validators.max(100000)],
      ],
      purchaseDiscount: ["", [Validators.min(0)]],
      taxableAmount: ["", [Validators.min(0), Validators.max(9999999)]],
      purchaseItemTax: [""],
      nonTaxable: ["", [Validators.min(0), Validators.max(9999999)]],
      taxable: [""],
      taxVendor: [""],
      taxVendorAmount: [""],
      vendorTaxApplied: ["", [Validators.min(1), Validators.max(100)]],
      taxApplied: [""],
      isTaxVendor: [false],
    });
    this.purchaseId = this.activeRoute.snapshot.params["id"];
  }
  @ViewChild(EditLotComponent) editLotComponent: EditLotComponent; // Access the EditLotComponent instance

  ngOnInit() {

    this.returnUrl = this.localStorageService.getItem("returnUrl");
    console.log(this.returnUrl);
    console.log("this is current url on purchase page", this.returnUrl);
    // const today = new Date();
    // const formattedDate = today.toLocaleDateString("en-US"); // Format to MM/DD/YYYY
    this.subCategoriesService.getSubCategories().subscribe((resp: any) => {
      this.subCategoryList = resp.data;
      console.log(this.subCategoryList);
      this.SubCategoryListsEditArray = [];
      this.subCategoryList.forEach((element: any) => {
        this.SubCategoryListsEditArray.push({
          name: element.name,
          _id: {
            _id: element._id,
            name: element.name,
          },
        });
      });
    });
    this.WarehouseService.getAllWarehouseList().subscribe((resp: any) => {
      this.wareHousedata = resp.data;
      this.wareHousedataListsEditArray = [];
      this.wareHousedata.forEach((element: any) => {
        this.wareHousedataListsEditArray.push({
          name: element.name,
          _id: {
            _id: element._id,
            name: element.name,
          },
        });
      });
    });
    this.NewPurchaseService.getPurchaseById(this.purchaseId).subscribe(
      (resp: any) => {
        this.editNewPurchaseForm.patchValue({
          invoiceNumber: resp.data.purchaseInvoiceNumber,
          purchaseDate: resp.data.purchaseDate,
          supplier: resp.data.supplier,
          _id: resp.data._id,
          purchaseType: resp.data.purchaseType,
          productId: resp.data.productId,
          taxableAmount: resp.data.taxable - resp.data.taxApplied,
          taxable: resp.data.taxable,
          nonTaxable: resp.data.nonTaxable,
          purchaseItemTax: resp.data.purchaseItemTax,
          isTaxVendor: resp.data.taxVendor ? true : false,
          taxVendor: {
              _id: resp.data?.taxVendor?._id,
              companyName: resp.data?.taxVendor?.companyName,
          },
          taxVendorAmount: resp.data?.taxVendor?.taxVendorAmount,
          vendorTaxApplied: resp.data?.taxVendor?.vendorTaxApplied,

        });

        if (resp.data.purchaseType === "lot") {
          this.NewPurchaseService.setFormData("stepFirstLotData", resp.data.lotDetails)
          this.lotTypeValue = resp.data.purchaseType;
          this.purchaseData = resp.data.lotDetails;
        }

        if (resp.data.purchaseType === "slab") {
          this.lotTypeValue = resp.data.purchaseType;
          this.findSubCategory(resp.data.slabDetails.categoryDetail);
          this.previousSlabValues = {
            slabNo: resp.data.slabDetails.slabNo,
            slabName: resp.data.slabDetails.slabName,
            warehouseDetails: resp.data.slabDetails.warehouseDetails,
            categoryDetail: resp.data.slabDetails.categoryDetail,
            subCategoryDetail: resp.data.slabDetails.subCategoryDetail,
            finishes: resp.data.slabDetails.finishes,
            totalSQFT: resp.data.slabDetails.totalSQFT,
            noOfPieces: resp.data.slabDetails.noOfPieces,
            sellingPricePerSQFT: resp.data.slabDetails.sellingPricePerSQFT,
            transportationCharges:
              resp.data.slabDetails.transportationCharges,
            otherCharges: resp.data.slabDetails.otherCharges,
            totalCosting: resp.data.slabDetails.totalCosting,
            thickness: resp.data.slabDetails.thickness,
            length: resp.data.slabDetails.length,
            width: resp.data.slabDetails.width,
            costPerSQFT: resp.data.slabDetails.costPerSQFT,
            sqftPerPiece: resp.data.slabDetails.sqftPerPiece || 0,
            paidToSupplierPurchaseCost: resp.data.taxable + resp.data.nonTaxable,
          };

        }
        this.lotType(resp.data.purchaseType);
      }
    );
    this.taxVendorsService.getTaxVendorList().subscribe((resp: any) => {
      if (resp.data) {
        this.taxVendorList = resp.data.map((element) => ({
          name: `${element.companyName} / ${element.city},`,
          _id: {
            _id: element._id,
            companyName: element.companyName,
          },
        }));
      }
    });

    this.SuppliersdataService.GetSupplierData().subscribe((data: any) => {
      this.getSupplierShow = data;
      this.SupplierLists = [];
      this.getSupplierShow.forEach((element: any) => {
        this.SupplierLists.push({
          name: element.name,
          _id: {
            _id: element._id,
            name: element.name,
            billingAddress: element.billingAddress,
          },
        });
      });
    });
    this.taxService.getAllTaxList().subscribe((resp: any) => {
      this.taxesListData = resp.data;
      this.orderTaxList = [];
      this.taxesListData.forEach((element: any) => {
        this.orderTaxList.push({
          orderTaxName: element.name + " (" + element.taxRate + "%" + ")",
          orderNamevalue: element,
        });
      });
    });
    this.categoriesService.getCategories().subscribe((resp: any) => {
      this.categoryList = resp.data;
      this.CategoryListsEditArray = [];
      this.categoryList.forEach((element: any) => {
        this.CategoryListsEditArray.push({
          name: element.name,
          _id: {
            _id: element._id,
            name: element.name,
          },
        });
      });
    });
    this.subCategoriesService.getSubCategories().subscribe((resp: any) => {
      this.subCategoryList = resp.data;
      this.SubCategoryListsEditArray = [];
      this.subCategoryList.forEach((element: any) => {
        this.SubCategoryListsEditArray.push({
          name: element.name,
          _id: {
            _id: element._id,
            name: element.name,
          },
        });
      });
    });
  }

  findSubCategory(value: any) {
    let SubCategoryData: any = [];
    this.editNewPurchaseForm.get("subCategoryDetail").reset();
    SubCategoryData = this.subCategoryList.filter(
      (e) => e.categoryId._id == value._id
    );
    this.subCategorListByCategory = SubCategoryData.map((e) => ({
      name: e.name,
      _id: {
        _id: e._id,
        name: e.name,
      },
    }));
  }

  backStep(prevCallback: any) {
    prevCallback.emit();
    this.editNewPurchaseForm.get("taxVendor").clearValidators();
    this.editNewPurchaseForm.get("taxVendorAmount").clearValidators();
    this.editNewPurchaseForm.get("vendorTaxApplied").clearValidators();
    this.editNewPurchaseForm.get("taxVendor").updateValueAndValidity();
    this.editNewPurchaseForm.get("taxVendorAmount").updateValueAndValidity();
    this.editNewPurchaseForm.get("vendorTaxApplied").updateValueAndValidity();
  }
  nextStep(nextCallback: any, page: string) {
    if (page == "first") {
      if (this.lotTypeValue == "lot") {
        this.child.LotEditFormSubmit();
        this.ItemDetails =
          this.NewPurchaseService.getFormData("stepFirstLotData");

        // Save the ItemDetails in local storage
        localStorage.setItem("lotFormData", JSON.stringify(this.ItemDetails));
        const payload = { ...this.ItemDetails };
        this.LotPayload = payload;

        this.editNewPurchaseForm.patchValue({
          paidToSupplierPurchaseCost: this.ItemDetails?.paidToSupplierLotCost,
          taxableAmount: this.ItemDetails?.taxableAmount,
          nonTaxable: this.ItemDetails?.nonTaxableAmount,
          taxable: this.ItemDetails?.taxable,
          purchaseItemTax: this.ItemDetails?.purchaseItemTax,
          taxApplied: this.ItemDetails?.taxApplied,
          _id: this.purchaseId
        });
      }
    }
    nextCallback.emit();
    this.changeVaidationForTaxVendor();
  }

  lotType(value: any) {
    this.lotTypeValue = value.toLowerCase();
    if (this.lotTypeValue == "lot") {
      this.previousSlabValues = {
        slabNo: this.editNewPurchaseForm.value.slabNo,
        slabName: this.editNewPurchaseForm.value.slabName,
        warehouseDetails: this.editNewPurchaseForm.value.warehouseDetails,
        categoryDetail: this.editNewPurchaseForm.value.categoryDetail,
        subCategoryDetail: this.editNewPurchaseForm.value.subCategoryDetail,
        finishes: this.editNewPurchaseForm.value.finishes,
        totalSQFT: this.editNewPurchaseForm.value.totalSQFT,
        noOfPieces: this.editNewPurchaseForm.value.noOfPieces,
        sellingPricePerSQFT: this.editNewPurchaseForm.value.sellingPricePerSQFT,
        transportationCharges:
          this.editNewPurchaseForm.value.transportationCharges,
        otherCharges: this.editNewPurchaseForm.value.otherCharges,
        totalCosting: this.editNewPurchaseForm.value.totalCosting,
        thickness: this.editNewPurchaseForm.value.thickness,
        length: this.editNewPurchaseForm.value.length,
        width: this.editNewPurchaseForm.value.width,
        costPerSQFT: this.editNewPurchaseForm.value.costPerSQFT,
        paidToSupplierPurchaseCost:
          this.editNewPurchaseForm.value.paidToSupplierPurchaseCost,
      };

      this.editNewPurchaseForm.patchValue({
        slabNo: "slabNo",
        slabName: "slabName",
        warehouseDetails: {
          _id: "123",
          name: "test",
        },
        categoryDetail: {
          _id: "123",
          name: "sdj",
        },
        subCategoryDetail: {
          _id: "123",
          name: "sdj",
        },
        finishes: {
          name: "Unpolished",
        },
        sellingPricePerSQFT: 2,
        totalSQFT: 2,
        noOfPieces: 2,
        costPerSQFT: 2,
        paidToSupplierPurchaseCost: 2,
      });
    } else {
      this.editNewPurchaseForm.patchValue({
        slabNo: this.previousSlabValues.slabNo,
        slabName: this.previousSlabValues.slabName,
        warehouseDetails: this.previousSlabValues.warehouseDetails,
        categoryDetail: this.previousSlabValues.categoryDetail,
        subCategoryDetail: this.previousSlabValues.subCategoryDetail,
        finishes: this.previousSlabValues.finishes,
        totalSQFT: this.previousSlabValues.totalSQFT,
        noOfPieces: this.previousSlabValues.noOfPieces,
        sellingPricePerSQFT: this.previousSlabValues.sellingPricePerSQFT,
        transportationCharges: this.previousSlabValues.transportationCharges,
        otherCharges: this.previousSlabValues.otherCharges,
        totalCosting: this.previousSlabValues.totalCosting,
        thickness: this.previousSlabValues.thickness,
        length: this.previousSlabValues.length,
        width: this.previousSlabValues.width,
        costPerSQFT: this.previousSlabValues.costPerSQFT,
        paidToSupplierPurchaseCost:
          this.previousSlabValues.paidToSupplierPurchaseCost,
      });
      this.calculateTotalAmount();
    }
  }
  calculateTotalAmount() {
    if (this.lotTypeValue == "slab") {
      let totalTaxAmount: number = 0;
      let paidToSupplierPurchaseCost =
        this.editNewPurchaseForm.get("paidToSupplierPurchaseCost")?.value || 0;
      let transportationCharges =
        this.editNewPurchaseForm.get("transportationCharges")?.value || 0;
      let otherCharges =
        this.editNewPurchaseForm.get("otherCharges")?.value || 0;
      let totalSQFT = this.editNewPurchaseForm.get("totalSQFT")?.value || 0;
      let costPerSQFT = this.editNewPurchaseForm.get("costPerSQFT")?.value || 0;
      let purchaseDiscount =
        this.editNewPurchaseForm.get("purchaseDiscount")?.value || 0;
      let noOfPieces = this.editNewPurchaseForm.get("noOfPieces")?.value || 1; // Default to 1 to avoid division by zero
      let taxableAmount =
        this.editNewPurchaseForm.get("taxableAmount")?.value || 0;
      let nonTaxable = this.editNewPurchaseForm.get("nonTaxable")?.value || 0;
      let purchaseItemTax =
        this.editNewPurchaseForm.get("purchaseItemTax")?.value;
      let sqftPerPiece = totalSQFT / noOfPieces;
      let taxable;

      if (Array.isArray(purchaseItemTax)) {
        purchaseItemTax.forEach((selectedTax: any) => {
          totalTaxAmount += (taxableAmount * selectedTax.taxRate) / 100;
        });
      } else if (purchaseItemTax) {
        totalTaxAmount = (taxableAmount * purchaseItemTax) / 100;
      }

      if (purchaseDiscount > 0) {
        if (!nonTaxable) {
          taxableAmount -= purchaseDiscount;
        } else {
          nonTaxable -= purchaseDiscount;
          this.editNewPurchaseForm.get("nonTaxable").patchValue(nonTaxable);
        }
      }
      taxable = taxableAmount + totalTaxAmount;
      paidToSupplierPurchaseCost = taxable + nonTaxable;
      const total: number =
        transportationCharges +
        otherCharges +
        paidToSupplierPurchaseCost +
        purchaseDiscount;
      if (totalSQFT !== 0) {
        costPerSQFT = total / totalSQFT;
      }
      if (total) {
        this.editNewPurchaseForm.patchValue({
          sellingPricePerSQFT: Number(costPerSQFT).toFixed(2),
          costPerSQFT: Number(costPerSQFT).toFixed(2),
          totalCosting: total,
          sqftPerPiece: sqftPerPiece,
          paidToSupplierPurchaseCost: paidToSupplierPurchaseCost,
          taxable: taxable,
          taxableAmount: taxableAmount,
          taxApplied: totalTaxAmount,
          nonTaxable: nonTaxable,
        });
      }
      if (this.editNewPurchaseForm.get("isTaxVendor").value) {
        this.calculateTaxVendorAmount();
      }
    }
  }

  calculateDiscount() {
    if (this.lotTypeValue === "slab") {
      let purchaseDiscount =
        this.editNewPurchaseForm.get("purchaseDiscount")?.value || 0;
      let taxableAmount =
        this.editNewPurchaseForm.get("taxableAmount")?.value || 0;
      let nonTaxable = this.editNewPurchaseForm.get("nonTaxable")?.value || 0;
      let totalTaxAmount = 0;

      if (purchaseDiscount > 0) {
        if (!nonTaxable) {
          taxableAmount -= purchaseDiscount;
          this.editNewPurchaseForm.get("taxableAmount").patchValue(nonTaxable);
        } else {
          nonTaxable -= purchaseDiscount;
          this.editNewPurchaseForm.get("nonTaxable").patchValue(nonTaxable);
        }
      }
    }
  }

  calculateTaxVendorAmount() {
    let totalTaxAmount: number =
      this.editNewPurchaseForm.get("taxableAmount").value;
    let vendorTaxApplied =
      this.editNewPurchaseForm.get("vendorTaxApplied").value;
    let taxVendorAmount = (totalTaxAmount * vendorTaxApplied) / 100;
    this.editNewPurchaseForm.patchValue({
      taxVendorAmount: taxVendorAmount.toFixed(2),
    });
  }

  changeVaidationForTaxVendor() {
    let isTaxVendor = this.editNewPurchaseForm.get("isTaxVendor").value;
    this.editNewPurchaseForm.get("taxVendor").clearValidators();
    this.editNewPurchaseForm.get("taxVendorAmount").clearValidators();
    this.editNewPurchaseForm.get("vendorTaxApplied").clearValidators();
    if (isTaxVendor) {
      this.editNewPurchaseForm
        .get("taxVendor")
        .setValidators([Validators.required]);
      this.editNewPurchaseForm
        .get("taxVendorAmount")
        .setValidators([Validators.required]);
      this.editNewPurchaseForm
        .get("vendorTaxApplied")
        .setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(100),
        ]);
    }
    this.editNewPurchaseForm.get("taxVendor").updateValueAndValidity();
    this.editNewPurchaseForm.get("taxVendorAmount").updateValueAndValidity();
    this.editNewPurchaseForm.get("vendorTaxApplied").updateValueAndValidity();

    if (isTaxVendor) {
      this.editNewPurchaseForm
        .get("paidToSupplierPurchaseCost")
        .patchValue(this.editNewPurchaseForm.get("nonTaxable").value);
    } else {
      this.lotTypeValue === "lot"
        ? this.editNewPurchaseForm
          .get("paidToSupplierPurchaseCost")
          .patchValue(this.ItemDetails.paidToSupplierLotCost)
        : this.editNewPurchaseForm
          .get("paidToSupplierPurchaseCost")
          .patchValue(this.editNewPurchaseForm.get("nonTaxable").value);
    }
  }

  // Optional: clear local storage if needed when the form is completed
  clearLocalStorage() {
    localStorage.removeItem("lotFormData");
  }
  editNewPurchaseFormSubmit() {
    const formData = this.editNewPurchaseForm.value;
    console.log(formData);

    let payload = {};
    this.NewPurchaseService.clearFormData();


    let taxVenoderObj = {
      _id: formData.taxVendor?._id,
      companyName: formData.taxVendor?.companyName,
      taxVendorAmount: Number(formData.taxVendorAmount),
      vendorTaxApplied: Number(formData.vendorTaxApplied),
    };
    if (this.editNewPurchaseForm.value.purchaseType == "lot") {
      if (formData && formData.paidToSupplierPurchaseCost !== undefined) {
        this.ItemDetails.purchaseCost = Number(
          formData.paidToSupplierPurchaseCost
        );
        this.ItemDetails.date = formData.purchaseDate;
        this.ItemDetails.notes = formData.purchaseNotes;
        this.ItemDetails._id = formData.productId;
      } else {
        console.error("formData.paidToSupplierPurchaseCost is not defined");
      }
      payload = {
        purchaseInvoiceNumber: formData.invoiceNumber,
        supplier: formData.supplier,
        purchaseDate: formData.purchaseDate,
        purchaseType: "lot",
        purchaseNotes: formData.purchaseNotes,
        purchaseCost: Number(formData.paidToSupplierPurchaseCost),
        purchaseTotalAmount: Number(this.ItemDetails.lotTotalCost).toFixed(2),
        lotDetail: this.ItemDetails,
        nonTaxable: Number(formData.nonTaxable),
        taxableAmount: Number(formData.taxableAmount),
        taxable: formData.taxable,
        purchaseItemTax: formData.purchaseItemTax,
        taxVendor: this.editNewPurchaseForm.get("isTaxVendor").value
          ? taxVenoderObj
          : null,
        taxApplied: formData.taxApplied,
        productId: formData.productId,
        _id: formData._id
      };
    } else {
      if (formData.width || formData.length || formData.thickness) {
        var _Size = `${formData.width ? formData.width : " "} x ${formData.length ? formData.length : " "
          } x ${formData.thickness ? formData.thickness : " "}`;
      }
      payload = {
        purchaseInvoiceNumber: formData.invoiceNumber,
        supplier: formData.supplier,
        purchaseDate: formData.purchaseDate,
        purchaseType: "slab",
        purchaseNotes: formData.purchaseNotes,
        purchaseCost: Number(formData.paidToSupplierPurchaseCost),
        slabDetail: {
          slabNo: formData.slabNo,
          slabName: formData.slabName,
          warehouseDetails: formData.warehouseDetails,
          categoryDetail: formData.categoryDetail,
          subCategoryDetail: formData.subCategoryDetail,
          totalSQFT: formData.totalSQFT,
          width: formData.width,
          length: formData.length,
          thickness: formData.thickness,
          finishes: formData.finishes,
          sellingPricePerSQFT: Number(formData.sellingPricePerSQFT),
          transportationCharges: Number(formData.transportationCharges),
          otherCharges: Number(formData.otherCharges),
          totalCosting: Number(formData.totalCosting),
          costPerSQFT: Number(formData.costPerSQFT),
          slabSize: _Size,
          purchaseCost: Number(formData.paidToSupplierPurchaseCost),
          purchaseDiscount: Number(formData.purchaseDiscount),
          sqftPerPiece: Number(formData.sqftPerPiece?.toFixed(2)),
          noOfPieces: Number(formData.noOfPieces?.toFixed(2)),
          date: formData.purchaseDate,
          notes: formData.purchaseNotes,
          _id: formData.productId
        },
        purchaseTotalAmount: Number(formData.totalCosting),
        nonTaxable: Number(formData.nonTaxable),
        taxableAmount: Number(formData.taxableAmount),
        taxable: formData.taxable,
        purchaseItemTax: formData.purchaseItemTax,
        taxVendor: this.editNewPurchaseForm.get("isTaxVendor").value
          ? taxVenoderObj
          : null,
        taxApplied: formData.taxApplied,
        _id: formData._id,
        productId: formData.productId,

      };
    }
    if (this.editNewPurchaseForm.valid) {
      console.log(payload)
      this.NewPurchaseService.UpdatePurchaseData(payload).subscribe((resp: any) => {
        if (resp) {
          if (resp.status === "success") {
            this.clearLocalStorage();
            this.NewPurchaseService.clearFormData();
            const message = "Purchase has been Updated added";
            this.messageService.add({ severity: "success", detail: message });
            setTimeout(() => {
              this.router.navigateByUrl(this.returnUrl);
            }, 400);
          } else {
            const message = resp.message;
            this.messageService.add({ severity: "error", detail: message });
          }
        }
      });
    } else {
      console.log("form is not valid");
    }
  }
}
