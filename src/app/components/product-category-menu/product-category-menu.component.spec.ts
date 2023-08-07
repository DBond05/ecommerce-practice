import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrductCategoryMenuComponent } from './product-category-menu.component';

describe('PrductCategoryMenuComponent', () => {
  let component: PrductCategoryMenuComponent;
  let fixture: ComponentFixture<PrductCategoryMenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PrductCategoryMenuComponent]
    });
    fixture = TestBed.createComponent(PrductCategoryMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
