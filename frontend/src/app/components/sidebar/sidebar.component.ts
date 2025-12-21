import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  template: `
    <!-- 修改处：class 增加了 super-glass -->
    <nav class="glass-nav super-glass">
      <div class="nav-logo"><mat-icon>cloud_queue</mat-icon></div>
      <div class="nav-group">
        <!-- 修改处：添加 matTooltipPosition="right" -->
        <button class="icon-btn" 
                [class.active]="activeMode === 'view'" 
                (click)="navigate.emit('view')" 
                matTooltip="媒体库"
                matTooltipPosition="right">
          <mat-icon>dashboard</mat-icon>
        </button>
        
        <!-- 修改处：添加 matTooltipPosition="right" -->
        <button class="icon-btn" 
                [class.active]="activeMode === 'add'" 
                (click)="navigate.emit('add')" 
                matTooltip="发布"
                matTooltipPosition="right">
          <mat-icon>add_circle</mat-icon>
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .glass-nav {
      /* 删除 @extend 行，直接保留下面的样式即可 */
      /* 这里的样式会覆盖 super-glass 的默认样式，实现胶囊形状 */
      width: 72px; border-radius: 36px;
      display: flex; flex-direction: column; align-items: center; padding: 30px 0;
      
      .nav-logo {
        color: #005bea; margin-bottom: 40px;
        filter: drop-shadow(0 4px 6px rgba(0, 91, 234, 0.3));
        mat-icon { font-size: 32px; width: 32px; height: 32px; }
      }
      .nav-group { display: flex; flex-direction: column; gap: 20px; }
      .icon-btn {
        width: 48px; height: 48px; border-radius: 50%; border: none; background: transparent; 
        color: var(--text-sec); cursor: pointer; transition: all 0.4s var(--ease-elastic);
        display: grid; place-items: center;
        &:hover { background: rgba(255,255,255,0.8); transform: translateY(-2px); color: #005bea; }
        &.active { 
          background: var(--primary-gradient); color: white; 
          box-shadow: 0 10px 20px -5px rgba(0, 91, 234, 0.4); transform: scale(1.1);
        }
      }
    }
  `]
})
export class SidebarComponent {
  @Input() activeMode: 'view' | 'add' | 'edit' = 'view';
  @Output() navigate = new EventEmitter<'view' | 'add'>();
}