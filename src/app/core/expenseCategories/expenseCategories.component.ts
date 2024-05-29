import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MenuItem, MessageService } from "primeng/api";
import { Subscription } from "rxjs";
import { routes } from "src/app/shared/routes/routes";
import { DialogModule } from "primeng/dialog";
import { ExpensesCategoriesdataService } from "./expenseCategories.service";
import {
  FormBuilder,
  Validators,
  FormGroup,
} from "@angular/forms";

@Component({
  selector: "app-expenseCategories",
  templateUrl: "./expenseCategories.component.html",
  styleUrls: ["./expenseCategories.component.scss"],
  providers: [MessageService],
})
export class ExpensesCategoriesComponent {
  items: MenuItem[] = [];
  public dataSource: any = [];
  public originalData: any = [];
  settingCategory = "";
  routes = routes;
  currentRoute!: string;
  routerChangeSubscription: Subscription;
  selectedCustomer = [];
  searchDataValue: any;
  showDialoge = false;
  modalData: any = {};
  expenseId: any;
  ExpensesByID: any;
  ExpensesDataById: any;
  addExpensesCategoryForm: FormGroup;
  editExpensesCategory: FormGroup;
  id: any;
  visible: boolean = false;
  visible1: boolean = false;
  constructor(
    private router: Router,
    private Service: ExpensesCategoriesdataService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private activeRoute: ActivatedRoute
  ) {
    this.addExpensesCategoryForm = this.fb.group({
      categoryName: ["", [Validators.required]],
      categoryDescription: [""],
    });
    this.editExpensesCategory = this.fb.group({
      categoryName: ["", [Validators.required]],
      categoryDescription: [""],
    });
    this.id = this.activeRoute.snapshot.params["id"];
  }
  getExpenses() {
    this.Service.GetExpensesCategriesData().subscribe((resp:any) => {
      this.dataSource = resp.data;
      this.originalData = resp.data;
    });
  }


  
  ngOnInit() {
    this.getExpenses();
  }
  showDialog() {
    this.visible = true;
    this.addExpensesCategoryForm.reset();
  }
  addCloseDialog() {
    this.visible = false;
  }
  closeDialogEdit() {
    this.visible1 = false;
  }
  showDialogEdit(id: any) {
    // this.editExpensesCategory.reset();
    this.visible1 = true;
    this.ExpensesByID = id;
    this.Service.GetExpenseCategriesDataById(id).subscribe((resp: any) => {
      this.patchValuesForm(resp.data);
    });
  }
  patchValuesForm(data: any) {
    this.editExpensesCategory.patchValue({
      categoryName: data.categoryName,
      categoryDescription: data.categoryDescription,
    });
  }
  // for delete api
  deleteExpense(Id: any) {
    this.expenseId = Id;
    this.modalData = {
      title: "Delete",
      messege: "Are you sure you want to delete this expense",
    };
    this.showNewDialog();
  }
  showNewDialog() {
    this.showDialoge = true;
  }
  callBackModal() {
    this.Service.DeleteExpensesCategriesApi(this.expenseId).subscribe((resp: any) => {
      this.messageService.add({ severity: "success", detail: resp.message });
      this.getExpenses();
      this.close();
    });
  }
  close() {
    this.showDialoge = false;
  }
  //

  public searchData(value: any): void {
    this.dataSource = this.originalData.filter((i) =>
      i.name.toLowerCase().includes(value.trim().toLowerCase())
    );
  }
  onPageChange(event) {
    const startIndex = event.first;
    const endIndex = startIndex + event.rows;
    const currentPageData = this.dataSource.slice(startIndex, endIndex);
  }

  addExpensesCategoryFormsubmit() {
    const payload = {
      categoryName: this.addExpensesCategoryForm.value.categoryName,
      categoryDescription: this.addExpensesCategoryForm.value.categoryDescription,
    };
    if (this.addExpensesCategoryForm.valid) {
      this.Service.AddExpensesCategriesdata(payload).subscribe((resp: any) => {
        this.visible = false;
        if (resp) {
          if (resp.status === "success") {
            const message = "Expenses Category has been added";
            this.messageService.add({ severity: "success", detail: message });
            this.getExpenses();
          } else {
            const message = resp.message;
            this.messageService.add({ severity: "error", detail: message });
          }
        }
      });
    } else {
      console.log("Form is invalid");
      
    }
  }


  editExpensesCategoryForm() {
    const payload = {
      id: this.ExpensesByID,
      categoryName: this.editExpensesCategory.value.categoryName,
      categoryDescription:
        this.editExpensesCategory.value.categoryDescription,
    };
    
    if (this.editExpensesCategory.valid) {
      this.Service.UpDataExpensesCategriesApi(payload).subscribe((resp: any) => {
          if (resp.status === "success") {
            this.closeDialogEdit();
            const message = "Expenses Category has been updated";
            this.messageService.add({ severity: "success", detail: message });
            this.getExpenses();
          } else {
            const message = resp.message;
            this.messageService.add({ severity: "error", detail: message });
          }
        }
      );
    } else {
      console.log("Form is invalid!");
    }
  }
}
