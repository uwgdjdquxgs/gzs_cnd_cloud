import { ComponentFixture, TestBed } from '@angular/core/testing';
// 1. 引用正确的类名 (DetailDialogComponent) 和文件名 (./detail-dialog)
import { DetailDialogComponent } from './detail-dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DetailDialogComponent', () => {
  let component: DetailDialogComponent;
  let fixture: ComponentFixture<DetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // 2. 导入组件
      imports: [DetailDialogComponent, HttpClientTestingModule],
      // 3. 提供 Mock 数据，防止 Material Dialog 报错
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { post: {} } },
        { provide: MatDialogRef, useValue: {} }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});