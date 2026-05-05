import { ComponentFixture, TestBed } from '@angular/core/testing';
import { XeroxPage } from './xerox.page';

describe('XeroxPage', () => {
  let component: XeroxPage;
  let fixture: ComponentFixture<XeroxPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(XeroxPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
