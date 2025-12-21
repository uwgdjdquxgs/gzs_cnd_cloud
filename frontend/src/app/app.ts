import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './services/api.service';
import { Post, Comment } from './models/post.model';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatIconModule, MatButtonModule, MatTooltipModule,
    MatProgressBarModule, MatSnackBarModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit {
  // ... 其他变量保持不变 ...
  posts: Post[] = [];
  loading = false;
  viewMode: 'view' | 'add' | 'edit' = 'add'; 
  showCommentPanel = false;
  selectedPost: Post | null = null;
  
  // 新增：控制输入框展开状态
  isInputExpanded = false; 

  formData: Partial<Post> = { header: '', text: '', mediaType: 'image' };
  previewUrl: string | null = null;
  uploading = false;
  newCommentText = '';
  newCommentName = '';

  constructor(private api: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit() { this.loadPosts(); }

  // ... loadPosts, selectPost, goAdd, goEdit 等保持不变 ...
  
  loadPosts() {
    this.loading = true;
    this.api.getPosts().subscribe({
      next: (data) => {
        this.posts = data;
        this.loading = false;
        if (this.posts.length > 0 && !this.selectedPost) {
          this.selectPost(this.posts[0]);
        } else if (this.posts.length === 0) {
          this.goAdd();
        }
      },
      error: () => { this.loading = false; this.showMsg('加载失败'); }
    });
  }

  selectPost(post: Post) {
    if (this.selectedPost?.id === post.id && this.viewMode === 'view') return;
    this.selectedPost = post;
    this.viewMode = 'view';
    this.showCommentPanel = false;
    this.isInputExpanded = false; // 切换帖子时重置输入框
    this.api.getPost(post.id).subscribe(fullData => {
      if(this.selectedPost?.id === fullData.id) this.selectedPost = fullData;
    });
  }

  goAdd() {
    this.selectedPost = null;
    this.formData = { header: '', text: '', mediaType: 'image' };
    this.previewUrl = null;
    this.viewMode = 'add';
    this.showCommentPanel = false;
  }

  goEdit() {
    if (!this.selectedPost) return;
    this.formData = { ...this.selectedPost };
    this.previewUrl = this.selectedPost.mediaUrl;
    this.viewMode = 'edit';
    this.showCommentPanel = false;
  }

  toggleComments() { 
    this.showCommentPanel = !this.showCommentPanel; 
    if(!this.showCommentPanel) this.isInputExpanded = false;
  }
  
  // 新增：切换输入框
  toggleInput(event: Event) {
    event.stopPropagation(); // 防止冒泡
    this.isInputExpanded = !this.isInputExpanded;
  }

  // 点击外部关闭输入框 (可选优化，目前通过按钮关闭)
  closeInput() {
    this.isInputExpanded = false;
  }

  // ... onFileSelected, save, afterSave, doLike, doDelete 保持不变 ...
  
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploading = true;
      this.formData.mediaType = file.type.startsWith('video') ? 'video' : 'image';
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
        this.uploading = false;
      };
      reader.readAsDataURL(file);
      (this.formData as any).file = file;
    }
  }

  async save() {
    if (!this.formData.header || !this.formData.text) return;
    this.uploading = true;
    try {
      const file = (this.formData as any).file;
      if (file) {
        const url = await this.uploadFilePromise(file);
        this.formData.mediaUrl = url;
      }
      if (this.viewMode === 'add') {
        this.api.createPost(this.formData).subscribe(() => this.afterSave('发布成功'));
      } else {
        this.api.updatePost(this.formData).subscribe(() => this.afterSave('更新成功'));
      }
    } catch (e) { this.uploading = false; this.showMsg('操作失败'); }
  }

  afterSave(msg: string) {
    this.uploading = false;
    this.showMsg(msg);
    this.loadPosts();
  }

  doLike() {
    if (!this.selectedPost) return;
    const post = this.selectedPost;
    post.likes = (post.likes || 0) + 1;
    this.api.likePost(post.id).subscribe();
  }

  doDelete() {
    if (!this.selectedPost || !confirm('确定删除?')) return;
    this.api.deletePost(this.selectedPost.id).subscribe(() => {
      this.showMsg('已删除');
      this.loadPosts();
    });
  }

  sendComment() {
    if (!this.selectedPost || !this.newCommentText) return;
    const tempName = this.newCommentName || '访客';
    
    // 发送后立即收起输入框，体验更好
    this.isInputExpanded = false;
    
    this.api.addComment(this.selectedPost.id, tempName, this.newCommentText)
      .subscribe(() => {
        const newC: Comment = {
          commentId: Date.now().toString(),
          commentName: tempName,
          commentText: this.newCommentText,
          commentTime: new Date().toISOString()
        };
        if(!this.selectedPost!.comments) this.selectedPost!.comments = [];
        this.selectedPost!.comments.push(newC);
        this.newCommentText = '';
      });
  }

  delComment(cId: string) {
    if (!this.selectedPost || !confirm('删除该评论?')) return;
    this.api.deleteComment(this.selectedPost.id, cId).subscribe(() => {
      this.selectedPost!.comments = this.selectedPost!.comments.filter(c => c.commentId !== cId);
    });
  }

  uploadFilePromise(file: File): Promise<string> {
    return new Promise((resolve) => {
      this.api.uploadFile(file).subscribe(url => resolve(url));
    });
  }

  showMsg(msg: string) {
    this.snackBar.open(msg, '关闭', { duration: 2000, verticalPosition: 'top' });
  }

  get commentCount(): number { return this.selectedPost?.comments?.length || 0; }
}