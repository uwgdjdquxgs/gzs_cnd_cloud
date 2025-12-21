import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="content-body animate-entry">
      <h1>{{isEdit ? 'Edit Post' : 'Create New'}}</h1>
      
      <div class="form-grid">
        <!-- 上传区域 -->
        <div class="upload-zone" (click)="fileInput.click()">
          <input #fileInput type="file" (change)="onFileSelect($event)" hidden accept="image/*,video/*">
          
          <div class="preview" *ngIf="previewUrl">
             <img [src]="previewUrl" *ngIf="formData.mediaType !== 'video'">
             <video [src]="previewUrl" *ngIf="formData.mediaType === 'video'" controls></video>
          </div>
          
          <div class="placeholder" *ngIf="!previewUrl">
             <mat-icon>cloud_upload</mat-icon>
             <span>点击上传图片或视频</span>
          </div>
        </div>

        <!-- 输入区域 -->
        <input class="modern-input title" placeholder="输入标题..." [(ngModel)]="formData.header">
        <textarea class="modern-input text" placeholder="输入正文内容..." [(ngModel)]="formData.text"></textarea>
        
        <div class="actions">
          <button class="btn-cancel" *ngIf="isEdit" (click)="cancel.emit()">取消</button>
          <button class="btn-save" (click)="onSubmit()" [disabled]="uploading">
            {{uploading ? '处理中...' : '保存发布'}}
          </button>
        </div>
      </div>
    </div>
  `,
  // ... template 不变 ...
styles: [`
    /* === 核心修改：表单也变成一张完整的卡片 === */
    :host {
      display: block;
      height: 100%;
      background: white; /* 自带白色背景 */
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-deep);
      overflow-y: auto; /* 允许内部滚动 */
      
      /* 同样的整体入场动画 */
      animation: cardEnter 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      transform-origin: center bottom;
    }

    @keyframes cardEnter {
      0% { opacity: 0; transform: translateY(20px) scale(0.98); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* 内容布局 */
    .content-body { 
      padding: 60px; 
      max-width: 700px; 
      margin: 0 auto; 
    }

    h1 { font-size: 2rem; margin-bottom: 30px; font-weight: 800; color: #1d1d1f; }
    
    .form-grid { display: flex; flex-direction: column; gap: 24px; }
    
    /* ... 其余 Input/Upload 样式保持不变 ... */
    .upload-zone {
      height: 240px; background: #f5f5f7; border-radius: 20px; border: 2px dashed #ddd;
      display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; position: relative;
      transition: 0.3s;
      &:hover { border-color: #005bea; background: #f0f4ff; }
      .preview { width: 100%; height: 100%; img, video { width: 100%; height: 100%; object-fit: contain; } }
      .placeholder { display: flex; flex-direction: column; align-items: center; color: #999; gap: 10px; }
    }
    
    .modern-input {
      padding: 16px; border-radius: 12px; border: 1px solid #e1e1e6; background: #fbfbfd;
      font-size: 1rem; outline: none; transition: 0.3s; width: 100%; box-sizing: border-box;
      &:focus { border-color: #005bea; background: white; box-shadow: 0 0 0 3px rgba(0,91,234,0.1); }
      &.title { font-size: 1.2rem; font-weight: bold; }
      &.text { min-height: 120px; resize: vertical; line-height: 1.6; }
    }
    
    .actions { display: flex; justify-content: flex-end; gap: 12px; }
    button { padding: 12px 24px; border-radius: 12px; border: none; font-weight: bold; cursor: pointer; transition: 0.2s; }
    .btn-save { background: var(--primary-gradient); color: white; &:hover { transform: scale(1.02); } &:disabled { opacity: 0.7; } }
    .btn-cancel { background: transparent; color: #666; &:hover { background: rgba(0,0,0,0.05); } }
`]
// ... class 不变 ...
})
export class PostFormComponent {
  @Input() isEdit = false;
  @Input() formData: Partial<Post> = {};
  @Input() previewUrl: string | null = null;
  @Input() uploading = false;
  
  @Output() fileSelect = new EventEmitter<any>();
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onFileSelect(event: any) { this.fileSelect.emit(event); }
  onSubmit() { this.save.emit(); }
}