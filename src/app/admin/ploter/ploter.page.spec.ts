import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PloterPage } from './ploter.page';

describe('PloterPage', () => {
  let component: PloterPage;
  let fixture: ComponentFixture<PloterPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PloterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
