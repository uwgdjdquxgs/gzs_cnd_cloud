import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon'; // 引入 Icon 模块
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatIconModule],
  template: `
    <aside class="island-list super-glass">
      <div class="island-header">
        <h2>Library</h2>
        <span class="count-badge">{{posts.length}} items</span>
      </div>
      
      <div class="list-scroll-area">
        <mat-progress-bar *ngIf="loading" mode="query" style="border-radius: 4px; height: 2px;"></mat-progress-bar>
        
        <div class="media-item" 
             *ngFor="let post of posts" 
             [class.active]="selectedId === post.id"
             (click)="select.emit(post)">
          
          <div class="media-thumb">
            <!-- 图片直接显示 -->
            <img [src]="post.mediaUrl" *ngIf="post.mediaType !== 'video'" loading="lazy">
            
            <!-- 视频：显示 video 标签作为缩略图，并叠加播放按钮 -->
            <ng-container *ngIf="post.mediaType === 'video'">
              <video [src]="post.mediaUrl" preload="metadata" muted></video>
              <div class="play-overlay">
                <mat-icon>play_arrow</mat-icon>
              </div>
            </ng-container>
          </div>
          
          <div class="media-info">
            <div class="m-title">{{post.header || 'Untitled'}}</div>
            <div class="m-date">{{post.createdAt | date:'MM/dd HH:mm'}}</div>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .island-list {
      width: 340px; border-radius: var(--radius-lg);
      display: flex; flex-direction: column; overflow: hidden;
    }
    .island-header {
      padding: 28px; display: flex; justify-content: space-between; align-items: baseline;
      h2 { margin: 0; font-size: 1.5rem; font-weight: 800; background: var(--primary-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .count-badge { font-weight: 600; font-size: 0.9rem; color: #aaa; }
    }
    .list-scroll-area { flex: 1; overflow-y: auto; padding: 0 16px 20px; }
    
    .media-item {
      display: flex; padding: 12px; border-radius: 20px; margin-bottom: 12px;
      cursor: pointer; transition: all 0.3s var(--ease-smooth); border: 1px solid transparent;
      &:hover { background: rgba(255,255,255,0.5); transform: translateX(4px); }
      &.active { 
        background: white; border-color: rgba(0, 91, 234, 0.1);
        box-shadow: 0 8px 16px rgba(0,0,0,0.05);
        .m-title { color: #005bea; }
      }
      
      .media-thumb {
        width: 56px; height: 56px; border-radius: 14px; overflow: hidden; margin-right: 16px; 
        position: relative; background: #000; flex-shrink: 0; /* 黑色背景适合视频 */
        box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05);
        
        img, video { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; display: block; }

        /* 视频播放遮罩 */
        .play-overlay {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0.3); /* 半透明黑 */
          display: flex; justify-content: center; align-items: center;
          color: white;
          mat-icon { font-size: 24px; width: 24px; height: 24px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); }
        }
      }
      
      &:hover .media-thumb img { transform: scale(1.1); }
      
      .media-info {
        flex: 1; display: flex; flex-direction: column; justify-content: center; overflow: hidden;
        .m-title { font-weight: 600; font-size: 1rem; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color 0.3s; }
        .m-date { font-size: 0.8rem; color: #999; }
      }
    }
  `]
})
export class PostListComponent {
  @Input() posts: Post[] = [];
  @Input() loading = false;
  @Input() selectedId: string | undefined;
  @Output() select = new EventEmitter<Post>();
}