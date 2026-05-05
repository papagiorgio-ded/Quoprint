import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserlaserPage } from './userlaser.page';

describe('UserlaserPage', () => {
  let component: UserlaserPage;
  let fixture: ComponentFixture<UserlaserPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UserlaserPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
