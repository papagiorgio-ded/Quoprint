import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserploterPage } from './userploter.page';

describe('UserploterPage', () => {
  let component: UserploterPage;
  let fixture: ComponentFixture<UserploterPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UserploterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
