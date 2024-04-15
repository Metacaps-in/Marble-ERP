import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PatientsListRoutingModule } from './patients-list-routing.module';
import { PatientsListComponent } from './patients-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ButtonModule } from 'primeng/button';


@NgModule({
  declarations: [
    PatientsListComponent
  ],
  imports: [
    CommonModule,
    PatientsListRoutingModule,
    SharedModule,
    ButtonModule
  ]
})
export class PatientsListModule { }
