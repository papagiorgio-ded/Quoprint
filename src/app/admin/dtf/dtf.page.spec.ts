import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DtfPage } from './dtf.page';

describe('DtfPage', () => {
  let component: DtfPage;
  let fixture: ComponentFixture<DtfPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DtfPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
