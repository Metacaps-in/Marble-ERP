import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { VisitReasonsRoutingModule } from './visit-reasons-routing.module';
import { VisitReasonListComponent } from './visit-reasons-list/table.component';



@NgModule({
  declarations: [
  ],
  imports: [
    VisitReasonListComponent, 
    VisitReasonsRoutingModule,
  ]
})
export class VisitReasonsModule { }