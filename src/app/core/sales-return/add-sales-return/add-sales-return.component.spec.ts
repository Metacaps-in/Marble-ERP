import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSalesReturnComponent } from './add-sales-return.component';

describe('AddSalesReturnComponent', () => {
  let component: AddSalesReturnComponent;
  let fixture: ComponentFixture<AddSalesReturnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSalesReturnComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddSalesReturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
