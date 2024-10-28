import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreRoutingModule } from './core-routing.module';
import { CoreComponent } from './core.component';
import { HeaderComponent } from '../common-component/header/header.component';
import { SidebarComponent } from '../common-component/sidebar/sidebar.component';
import { SharedModule } from '../shared/shared.module';
import { ModalComponent } from './modal/modal.component';
import { FilterPipe } from './filter.pipe';
import { InvoiceDialogComponent } from '../common-component/modals/invoice-dialog/invoice-dialog.component';


@NgModule({
  declarations: [
    CoreComponent,
    SidebarComponent,
    ModalComponent,
  ],
  imports: [
    CommonModule,
    CoreRoutingModule,
    SharedModule,
    HeaderComponent,

    // InvoiceDialogComponent
  ],
})
export class CoreModule { }
