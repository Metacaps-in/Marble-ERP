import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaxesListComponent } from './taxes-list/taxes-list.component';

const routes: Routes = [{ path: '', component: TaxesListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaxesRoutingModule { }