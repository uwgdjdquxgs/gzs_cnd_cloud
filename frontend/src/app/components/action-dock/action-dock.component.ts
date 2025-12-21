import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-action-dock',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="glass-dock">
      
      <!-- 点赞 -->
      <div class="dock-item" (click)="like.emit()" matTooltip="Like" matTooltipPosition="left">
        <mat-icon [style.color]="likes > 0 ? '#ff3b30' : ''">favorite</mat-icon>
        <span class="dock-badge red" *ngIf="likes > 0">{{likes}}</span>
      </div>
      
      <!-- 评论 -->
      <div class="dock-item" (click)="toggleComments.emit()" matTooltip="Comments" matTooltipPosition="left">
        <mat-icon [style.color]="showComments ? '#005bea' : ''">chat_bubble</mat-icon>
        <span class="dock-badge blue" *ngIf="commentCount > 0">{{commentCount}}</span>
      </div>

      <div class="dock-divider"></div>

      <!-- 编辑 -->
      <div class="dock-item" (click)="edit.emit()" matTooltip="Edit" matTooltipPosition="left">
        <mat-icon>edit</mat-icon>
      </div>
      
      <!-- 删除 -->
      <div class="dock-item danger" (click)="delete.emit()" matTooltip="Delete" matTooltipPosition="left">
        <mat-icon>delete</mat-icon>
      </div>

    </div>
  `,
  styles: [`
    /* === 容器：毛玻璃胶囊 === */
    .glass-dock {
      position: absolute; top: 40px; right: 40px;
      
      /* 材质升级：高通透磨砂 */
      background: rgba(255, 255, 255, 0.65);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.5);
      box-shadow: 0 15px 40px rgba(0,0,0,0.1);
      
      border-radius: 50px; 
      padding: 10px; 
      display: flex; flex-direction: column; gap: 16px;
      z-index: 100; /* 确保在最上层 */

      /* === 核心动画：跟随详情页出现 === */
      /* backward: 动画开始前保持第一帧状态(透明)，delay 0.2s 形成错落感 */
      animation: dockFloatIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s backwards;
    }

    /* 动画定义：从右侧微缩放弹入 */
    @keyframes dockFloatIn {
      0% { 
        opacity: 0; 
        transform: translateX(30px) scale(0.8); 
      }
      100% { 
        opacity: 1; 
        transform: translateX(0) scale(1); 
      }
    }

    /* === 按钮项 === */
    .dock-item {
      width: 44px; height: 44px; border-radius: 50%;
      display: grid; place-items: center; cursor: pointer;
      color: #555; transition: 0.3s; position: relative;
      
      /* 悬停效果：加深背景 */
      &:hover { 
        background: rgba(255, 255, 255, 0.8); 
        color: #005bea; 
        transform: scale(1.15); 
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      }
      
      &.danger:hover { color: #ff3b30; background: rgba(255, 59, 48, 0.1); }
    }

    /* 角标 */
    .dock-badge {
      position: absolute; top: -2px; right: -2px;
      color: white; font-size: 10px; font-weight: 700;
      padding: 2px 6px; border-radius: 10px; 
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      border: 2px solid rgba(255,255,255,0.8); /* 增加描边让它在玻璃上更清晰 */
      
      &.red { background: #ff3b30; }
      &.blue { background: #005bea; }
    }

    /* 分割线 */
    .dock-divider { 
      height: 1px; 
      background: rgba(0,0,0,0.1); /* 降低透明度适配毛玻璃 */
      margin: 0 10px; 
    }
  `]
})
export class ActionDockComponent {
  @Input() likes = 0;
  @Input() commentCount = 0;
  @Input() showComments = false;
  
  @Output() like = new EventEmitter<void>();
  @Output() toggleComments = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
}