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
      <div class="dock-item" (click)="like.emit()" >
        <mat-icon [style.color]="likes > 0 ? '#ff3b30' : ''">favorite</mat-icon>
        <span class="dock-badge red" *ngIf="likes > 0">{{likes}}</span>
      </div>
      <div class="dock-item" (click)="toggleComments.emit()" >
        <mat-icon [style.color]="showComments ? '#005bea' : ''">chat_bubble</mat-icon>
        <span class="dock-badge blue" *ngIf="commentCount > 0">{{commentCount}}</span>
      </div>
      <div class="dock-divider"></div>
      <div class="dock-item" (click)="edit.emit()" ><mat-icon>edit</mat-icon></div>
      <div class="dock-item danger" (click)="delete.emit()"><mat-icon>delete</mat-icon></div>
    </div>
  `,
  styles: [`
    .glass-dock {
      position: absolute; top: 40px; right: 40px;
      background: white; border-radius: 20px; 
      padding: 10px; display: flex; flex-direction: column; gap: 16px;
      box-shadow: 0 15px 40px rgba(0,0,0,0.1); z-index: 10;
    }
    .dock-item {
      width: 40px; height: 40px; border-radius: 12px;
      display: grid; place-items: center; cursor: pointer;
      color: #666; transition: 0.3s; position: relative;
      &:hover { background: #f5f5f7; color: #005bea; transform: scale(1.1); }
      &.danger:hover { color: #ff3b30; }
    }
    .dock-badge {
      position: absolute; top: -4px; right: -4px;
      color: white; font-size: 10px; font-weight: 700;
      padding: 2px 6px; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      &.red { background: #ff3b30; }
      &.blue { background: #005bea; }
    }
    .dock-divider { height: 1px; background: #eee; margin: 0 8px; }
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