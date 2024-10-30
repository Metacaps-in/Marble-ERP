import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VisitReasonListComponent } from './visit-reasons-list/table.component';


const routes: Routes = [{ path: '', component: VisitReasonListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VisitReasonsRoutingModule { }