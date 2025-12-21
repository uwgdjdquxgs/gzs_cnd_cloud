import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../../models/post.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <!-- 背景层 -->
    <div *ngIf="post.mediaType !== 'video'" class="flux-background img-bg" [style.backgroundImage]="'url(' + post.mediaUrl + ')'"></div>
    
    <!-- 视频背景：更重的模糊 -->
    <video *ngIf="post.mediaType === 'video'" [src]="post.mediaUrl" class="flux-background vid-bg" autoplay muted loop playsinline></video>

    <div class="flux-overlay"></div>

    <div class="scroll-container">
      <div class="content-wrapper">
        <div class="media-stage" [class.is-video]="post.mediaType === 'video'">
          <div *ngIf="post.mediaType !== 'video'" class="media-shadow" [style.backgroundImage]="'url(' + post.mediaUrl + ')'"></div>
          <img [src]="post.mediaUrl" *ngIf="post.mediaType !== 'video'" class="main-media">
          <video *ngIf="post.mediaType === 'video'" [src]="post.mediaUrl" controls autoplay loop playsinline class="main-media"></video>
        </div>

        <div class="info-card super-glass">
          <div class="card-header">
            <h1>{{post.header}}</h1>
            <div class="meta-row">
              <span class="meta-item time"><mat-icon>schedule</mat-icon>{{post.createdAt | date:'yyyy/MM/dd HH:mm'}}</span>
              <span class="meta-divider">·</span>
              <span class="meta-item type"><mat-icon>{{post.mediaType === 'video' ? 'videocam' : 'image'}}</mat-icon>{{post.mediaType === 'video' ? 'Video' : 'Image'}}</span>
            </div>
          </div>
          <div class="card-divider"></div>
          <div class="card-body"><p>{{post.text}}</p></div>
        </div>
        <div class="spacer"></div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block; height: 100%; position: relative; overflow: hidden;
      /* 移除 host 动画，由父容器 stage-container 控制 */
      background: white;
    }

    .flux-background {
      position: absolute; inset: -50px; width: calc(100% + 100px); height: calc(100% + 100px);
      object-fit: cover; z-index: 0; opacity: 0.6;
      filter: blur(80px) saturate(150%);
    }

    /* 视频背景特调：模糊加重，亮度压低 */
    .vid-bg {
      filter: blur(120px) brightness(0.4) saturate(120%); 
      opacity: 0.8;
    }

    .flux-overlay { position: absolute; inset: 0; background: rgba(255, 255, 255, 0.4); z-index: 1; backdrop-filter: blur(30px); }
    .scroll-container { position: relative; z-index: 10; height: 100%; overflow-y: auto; scroll-behavior: smooth; }
    .scroll-container::-webkit-scrollbar { width: 0; }
    .content-wrapper { max-width: 800px; margin: 0 auto; padding: 40px; display: flex; flex-direction: column; align-items: center; gap: 40px; }
    
    .media-stage { position: relative; width: 100%; display: flex; justify-content: center; animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s backwards; &.is-video { width: 100%; } }
    .media-shadow { position: absolute; top: 20px; left: 10%; right: 10%; bottom: -20px; background-size: cover; background-position: center; filter: blur(40px) opacity(0.6); z-index: -1; border-radius: 50%; }
    
    .main-media { display: block; max-width: 100%; max-height: 60vh; border-radius: 20px; box-shadow: 0 20px 50px -10px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.2); object-fit: contain; background: rgba(0,0,0,0.05); }
    video.main-media { width: 100%; background: black; }

    .info-card { width: 100%; background: rgba(255, 255, 255, 0.65); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.6); border-radius: 24px; padding: 40px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05); animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s backwards; }
    .card-header h1 { margin: 0 0 16px 0; font-size: 2rem; font-weight: 800; color: #1d1d1f; line-height: 1.2; letter-spacing: -0.01em; }
    .meta-row { display: flex; align-items: center; gap: 10px; color: #86868b; font-size: 0.9rem; font-weight: 500; .meta-item { display: flex; align-items: center; gap: 6px; mat-icon { font-size: 18px; width: 18px; height: 18px; } } .meta-divider { font-weight: bold; opacity: 0.3; } }
    .card-divider { height: 1px; background: rgba(0,0,0,0.06); margin: 30px 0; }
    .card-body p { margin: 0; font-size: 1.1rem; line-height: 1.8; color: #333; white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .spacer { height: 60px; }
    
    @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class PostDetailComponent {
  @Input({ required: true }) post!: Post;
}