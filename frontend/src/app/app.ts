import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from './services/api.service';
import { Post, Comment } from './models/post.model';

// 引入子组件
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { PostListComponent } from './components/post-list/post-list.component';
import { PostDetailComponent } from './components/post-detail/post-detail.component';
import { PostFormComponent } from './components/post-form/post-form.component';
import { ActionDockComponent } from './components/action-dock/action-dock.component';
import { CommentDrawerComponent } from './components/comment-drawer/comment-drawer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, MatSnackBarModule,
    SidebarComponent, PostListComponent, PostDetailComponent, 
    PostFormComponent, ActionDockComponent, CommentDrawerComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit {
  // 数据与状态
  posts: Post[] = [];
  loading = false;
  viewMode: 'view' | 'add' | 'edit' = 'add'; 
  showComments = false;
  selectedPost: Post | null = null;
  
  // 表单相关
  formData: Partial<Post> = {};
  previewUrl: string | null = null;
  uploading = false;

  // 🌟 新增：评论 Loading 状态
  isCommentSubmitting = false;
  commentDeletingId: string | null = null;

  constructor(private api: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit() { this.loadPosts(); }

  // 3. 修改 loadPosts，支持跳转目标
  loadPosts(selectFirst = false, selectId: string | null = null) {
    this.loading = true;
    this.api.getPosts().subscribe({
      next: (data) => {
        this.posts = data;
        this.loading = false;

        if (this.posts.length > 0) {
          if (selectFirst) {
            // 场景：发布后，选第一条
            this.onSelectPost(this.posts[0]);
          } else if (selectId) {
            // 场景：修改后，选回刚才那条
            const target = this.posts.find(p => p.id === selectId);
            if (target) this.onSelectPost(target);
            else this.onSelectPost(this.posts[0]); // 找不到就选第一条兜底
          } else if (!this.selectedPost) {
            // 场景：初始化
            this.onSelectPost(this.posts[0]);
          }
        } else {
          this.onNavigate('add');
        }
      },
      error: () => { 
        this.loading = false; 
        this.showMsg('加载失败'); 
      }
    });
  }

  onSelectPost(post: Post) {
    if (this.selectedPost?.id === post.id && this.viewMode === 'view') return;
    this.selectedPost = post;
    this.viewMode = 'view';
    this.showComments = false;
    this.api.getPost(post.id).subscribe(fullData => {
      if(this.selectedPost?.id === fullData.id) this.selectedPost = fullData;
    });
  }

  onNavigate(mode: 'view' | 'add') {
    if (mode === 'add') {
      this.selectedPost = null;
      this.formData = { header: '', text: '', mediaType: 'image' };
      this.previewUrl = null;
      this.viewMode = 'add';
    } else {
      if (this.posts.length > 0) this.onSelectPost(this.posts[0]);
    }
    this.showComments = false;
  }

  onGoEdit() {
    if (!this.selectedPost) return;
    this.formData = { ...this.selectedPost };
    this.previewUrl = this.selectedPost.mediaUrl;
    this.viewMode = 'edit';
    this.showComments = false;
  }

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

  // 2. 保存/修改 跳转逻辑
  async onSavePost() {
    if (!this.formData.header || !this.formData.text) return;
    this.uploading = true;
    
    try {
      // 上传文件逻辑 (保持不变)
      const file = (this.formData as any).file;
      if (file) {
        const url = await new Promise<string>(resolve => 
          this.api.uploadFile(file).subscribe(u => resolve(u))
        );
        this.formData.mediaUrl = url;
      }

      // 保存逻辑
      if (this.viewMode === 'add') {
        // === 发布场景 ===
        this.api.createPost(this.formData).subscribe(() => {
          this.showMsg('发布成功');
          this.uploading = false;
          // 发布后：重新加载列表，并选中第一条(假设新数据在最前)
          this.loadPosts(true); 
        });
      } else {
        // === 修改场景 ===
        const currentId = this.formData.id!; // 记住当前ID
        this.api.updatePost(this.formData).subscribe(() => {
          this.showMsg('更新成功');
          this.uploading = false;
          // 修改后：重新加载列表，并传入 ID 以便选中当前条
          this.loadPosts(false, currentId);
        });
      }
    } catch (e) {
      this.uploading = false;
      this.showMsg('操作失败');
    }
  }


  afterSave(msg: string) {
    this.uploading = false;
    this.showMsg(msg);
    this.loadPosts();
  }

  onLike() {
    if (!this.selectedPost) return;
    const post = this.selectedPost;
    post.likes = (post.likes || 0) + 1;
    this.api.likePost(post.id).subscribe();
  }

  // 1. 删除跳转：跳到第一条
  onDeletePost() {
    if (!this.selectedPost || !confirm('确定删除?')) return;
    
    // 乐观更新：先从 UI 移除
    const deletedId = this.selectedPost.id;
    this.posts = this.posts.filter(p => p.id !== deletedId);
    
    // 立即跳转逻辑
    if (this.posts.length > 0) {
      this.onSelectPost(this.posts[0]); // 跳到剩下的第一条
    } else {
      this.onNavigate('add'); // 没数据了，跳到新增页
    }

    // 后台发请求 (静默处理或报错回滚)
    this.api.deletePost(deletedId).subscribe({
      next: () => this.showMsg('已删除'),
      error: () => {
        this.showMsg('删除失败，正在刷新...');
        this.loadPosts(); // 失败则重载
      }
    });
  }

  // 🌟 修改：添加评论 (带 Loading)
  onAddComment(data: {name: string, text: string}) {
    if (!this.selectedPost) return;
    
    this.isCommentSubmitting = true; // 开始 loading

    this.api.addComment(this.selectedPost.id, data.name, data.text).subscribe({
      next: () => {
        const newC: Comment = {
          commentId: Date.now().toString(),
          commentName: data.name,
          commentText: data.text,
          commentTime: new Date().toISOString()
        };
        if(!this.selectedPost!.comments) this.selectedPost!.comments = [];
        this.selectedPost!.comments.push(newC);
        
        this.isCommentSubmitting = false; // 结束 loading
        
        // 这是一个 Hack，用来通知子组件清空输入框
        // 更好的做法是用 Subject，但这里为了简单，我们让子组件监听 OnChanges
        // 或者我们可以在子组件里直接清空，父组件只管状态
      },
      error: () => {
        this.isCommentSubmitting = false;
        this.showMsg('评论失败');
      }
    });
  }

  // 🌟 修改：删除评论 (带 Loading)
  // 删除评论方法
  onDeleteComment(cId: string) {
    if (!this.selectedPost || !confirm('删除该评论?')) return;
    
    this.commentDeletingId = cId; // 1. 开始 Loading 动画

    this.api.deleteComment(this.selectedPost.id, cId).subscribe({
      next: () => {
        const currentComments = this.selectedPost!.comments || [];
        this.selectedPost!.comments = currentComments.filter(c => c.commentId !== cId);
        
        this.commentDeletingId = null; // 2. 结束 Loading
        this.showMsg('评论删除成功');   // 3. ✅ 新增：成功提示
      },
      error: () => {
        this.commentDeletingId = null;
        this.showMsg('删除失败');
      }
    });
  }

  showMsg(msg: string) {
    this.snackBar.open(msg, '', { duration: 2000, verticalPosition: 'top' });
  }
}