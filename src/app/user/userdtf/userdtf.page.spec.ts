import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserdtfPage } from './userdtf.page';

describe('UserdtfPage', () => {
  let component: UserdtfPage;
  let fixture: ComponentFixture<UserdtfPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UserdtfPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
