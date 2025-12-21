import { Component, EventEmitter, Input, Output, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Comment } from '../../models/post.model';

@Component({
  selector: 'app-comment-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="comment-drawer super-glass" [class.is-open]="isOpen">
      <div class="drawer-header">
        <h3>Comments ({{comments.length}})</h3>
        <button class="close-btn" (click)="close.emit()"><mat-icon>close</mat-icon></button>
      </div>

      <div class="drawer-body">
        <div *ngIf="comments.length === 0" class="empty-state">
          <mat-icon>chat_bubble_outline</mat-icon>
          <p>快来发表第一条评论</p>
        </div>

        <div class="chat-bubble-wrapper" *ngFor="let c of comments">
          <div class="chat-row">
            <div class="avatar">{{c.commentName.charAt(0)}}</div>
            <div class="bubble-content">
              <span class="name">{{c.commentName}}</span>
              <div class="text">{{c.commentText}}</div>
            </div>
            
            <!-- 删除区域：根据 deletingId 显示转圈或按钮 -->
            <div class="action-area">
              <mat-spinner *ngIf="deletingId === c.commentId" diameter="20" color="warn"></mat-spinner>
              <button *ngIf="deletingId !== c.commentId" class="bubble-del-btn" (click)="deleteComment.emit(c.commentId)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>
          <div class="timestamp">{{c.commentTime | date:'MM/dd HH:mm'}}</div>
        </div>
        <div style="height: 120px;"></div>
      </div>

      <!-- 灵动岛区域 -->
      <div class="floating-input-area" 
           [class.expanded]="isInputExpanded"
           (click)="!isInputExpanded && toggleInput($event)">
           
        <!-- 加号图标 (确保绝对居中) -->
        <div class="input-icon">
           <mat-icon>add</mat-icon>
        </div>

        <!-- 表单区域 -->
        <div class="input-form" (click)="$event.stopPropagation()">
          <input type="text" placeholder="你的昵称" [(ngModel)]="newName" [disabled]="isSubmitting">
          <input type="text" placeholder="说点什么..." [(ngModel)]="newText" (keyup.enter)="!isSubmitting && onSend()" [disabled]="isSubmitting">
          
          <div class="send-action">
            <button (click)="isInputExpanded = false" class="btn-cancel" [disabled]="isSubmitting">取消</button>
            
            <button (click)="onSend()" class="btn-send" [disabled]="isSubmitting">
              <span *ngIf="!isSubmitting">发送</span>
              <mat-spinner *ngIf="isSubmitting" diameter="18" style="margin:0 auto;"></mat-spinner>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* 抽屉基础 */
    .comment-drawer {
      position: absolute; top: 16px; right: 16px; bottom: 16px; width: 380px; 
      border-radius: 24px; z-index: 20;
      display: flex; flex-direction: column;
      transform: translateX(120%); opacity: 0;
      transition: transform 0.5s var(--ease-elastic), opacity 0.4s ease;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(40px);
      border: 1px solid rgba(255, 255, 255, 0.5);
      box-shadow: -10px 0 40px rgba(0,0,0,0.1);
      &.is-open { transform: translateX(0); opacity: 1; }
    }
    .drawer-header { padding: 24px; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; h3 { margin: 0; font-size: 1.1rem; } .close-btn { background:none; border:none; cursor:pointer; color:#666; } }
    .drawer-body { flex: 1; overflow-y: auto; padding: 20px; &::-webkit-scrollbar { width: 0; } }
    .empty-state { text-align:center; padding-top: 100px; color: #999; mat-icon { font-size:40px; width:40px; height:40px; margin-bottom:10px; } }

    /* 气泡 */
    .chat-bubble-wrapper { margin-bottom: 20px; }
    .chat-row { display: flex; gap: 12px; position: relative; padding-right: 30px; }
    .avatar { width: 36px; height: 36px; border-radius: 12px; flex-shrink:0; background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%); color: white; display: grid; place-items: center; font-weight: bold; }
    .bubble-content { background: white; padding: 10px 14px; border-radius: 16px; border-top-left-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); max-width: 100%; .name { font-size: 0.75rem; font-weight: 700; color: #888; display: block; margin-bottom: 2px; } .text { font-size: 0.95rem; line-height: 1.5; color: #333; } }
    .timestamp { margin-left: 48px; margin-top: 4px; font-size: 0.7rem; color: #aaa; }
    
    /* 删除按钮 */
    .action-area { position: absolute; right: 0; top: 10px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; }
    .bubble-del-btn { width: 28px; height: 28px; border-radius: 50%; background: #ff3b30; color: white; border: none; display: grid; place-items: center; cursor: pointer; opacity: 0; transition: all 0.3s; transform: scale(0.8); mat-icon { font-size: 16px; width: 16px; height: 16px; } }
    .chat-row:hover .bubble-del-btn { opacity: 1; transform: scale(1); }

    /* === 灵动岛 (CSS 修复) === */
    .floating-input-area {
      position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
      width: 56px; height: 56px; 
      
      /* 修复透明度：使用更低的 alpha 值 (0.55) */
      background: rgba(0, 91, 234, 0.55);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.4);
      
      border-radius: 28px; 
      box-shadow: 0 10px 30px rgba(0, 91, 234, 0.3);
      transition: all 0.5s var(--ease-elastic); z-index: 30; overflow: hidden; cursor: pointer;
      display: flex; align-items: center; justify-content: center;

      /* 修复图标：强制 flex 居中，确保 color 为 white */
      .input-icon { 
        position: absolute; inset: 0;
        display: flex; justify-content: center; align-items: center;
        color: white; 
        transition: 0.3s;
        mat-icon { font-size: 32px; width: 32px; height: 32px; }
      }

      .input-form {
        opacity: 0; pointer-events: none; width: 100%; padding: 0 16px;
        display: flex; flex-direction: column; gap: 10px; transition: opacity 0.3s;
        
        input { 
          background: rgba(255,255,255,0.25); border: none; outline: none; 
          color: white; padding: 12px; border-radius: 10px; 
          &::placeholder { color: rgba(255,255,255,0.85); } 
          &:disabled { opacity: 0.6; }
        }
        
        .send-action { display: flex; justify-content: flex-end; gap: 10px; align-items: center; }
        .btn-cancel { background: transparent; color: rgba(255,255,255,0.9); border: none; cursor: pointer; }
        
        .btn-send { 
          background: white; color: #005bea; border: none; 
          padding: 6px 16px; height: 32px; border-radius: 16px; min-width: 60px;
          font-weight: bold; cursor: pointer; 
          display: flex; align-items: center; justify-content: center;
          &:disabled { opacity: 0.7; cursor: not-allowed; }
        }
      }

      &.expanded {
        width: 90%; height: 180px; border-radius: 24px; cursor: default;
        /* 展开后的背景也调透明一点 */
        background: rgba(0, 91, 234, 0.75);
        backdrop-filter: blur(30px);
        
        .input-icon { opacity: 0; transform: scale(0.5); }
        .input-form { opacity: 1; pointer-events: auto; transition-delay: 0.1s; }
      }
    }
  `]
})
export class CommentDrawerComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() comments: Comment[] = [];
  
  // 必须接收父组件的状态，否则不知道何时显示 Loading
  @Input() isSubmitting = false;
  @Input() deletingId: string | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() addComment = new EventEmitter<{name: string, text: string}>();
  @Output() deleteComment = new EventEmitter<string>();

  isInputExpanded = false;
  newName = '';
  newText = '';

  toggleInput(event: Event) {
    event.stopPropagation();
    this.isInputExpanded = !this.isInputExpanded;
  }

  onSend() {
    if(!this.newText) return;
    this.addComment.emit({ name: this.newName || '访客', text: this.newText });
    // 注意：这里不要立即设置 isInputExpanded = false，而是等待 ngOnChanges 检测状态变化
  }

  // 修复：自动收起逻辑
  ngOnChanges(changes: SimpleChanges) {
    // 监听 isSubmitting 变化：如果从 true 变回了 false，说明提交完成
    if (changes['isSubmitting']) {
      const prev = changes['isSubmitting'].previousValue;
      const curr = changes['isSubmitting'].currentValue;
      
      // 提交完成 (true -> false)
      if (prev === true && curr === false) {
        this.isInputExpanded = false; // 收起面板
        this.newText = ''; // 清空输入
      }
    }
  }
}