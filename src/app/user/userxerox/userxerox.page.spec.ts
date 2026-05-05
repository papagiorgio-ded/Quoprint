import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserxeroxPage } from './userxerox.page';

describe('UserxeroxPage', () => {
  let component: UserxeroxPage;
  let fixture: ComponentFixture<UserxeroxPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UserxeroxPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
