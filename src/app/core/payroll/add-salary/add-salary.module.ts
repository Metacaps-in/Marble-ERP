import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddSalaryRoutingModule } from './add-salary-routing.module';
import { AddSalaryComponent } from './add-salary.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { DropdownModule } from 'primeng/dropdown';


@NgModule({
  declarations: [
    AddSalaryComponent
  ],
  imports: [
    CommonModule,
    AddSalaryRoutingModule,
    SharedModule,
    DropdownModule
  ]
})
export class AddSalaryModule { }
