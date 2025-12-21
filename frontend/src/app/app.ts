import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from './services/api.service';
import { Post } from './models/post.model';

// Material Imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// 引入我们刚才写的组件
// 修改后 (正确的代码 - 注意去掉了 .component):
import { PostDialogComponent } from './components/post-dialog/post-dialog';
import { DetailDialogComponent } from './components/detail-dialog/detail-dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule, MatCardModule, MatButtonModule, MatIconModule,
    MatProgressBarModule, MatMenuModule, MatDialogModule, MatSnackBarModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit {
  posts: Post[] = [];
  loading = false;

  constructor(
    private api: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.loading = true;
    this.api.getPosts().subscribe({
      next: (data) => {
        this.posts = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.showMsg('加载失败，请检查网络');
        this.loading = false;
      }
    });
  }

  // 打开新增弹窗
  openAddDialog() {
    const dialogRef = this.dialog.open(PostDialogComponent, {
      width: '600px',
      data: { post: null } // 新增模式
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showMsg('发布成功！');
        this.loadPosts();
      }
    });
  }

  // 打开编辑弹窗
  openEdit(post: Post) {
    const dialogRef = this.dialog.open(PostDialogComponent, {
      width: '600px',
      data: { post: post } // 编辑模式，传入当前post
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showMsg('修改已保存');
        this.loadPosts();
      }
    });
  }

  // 打开详情弹窗
  openDetail(post: Post) {
    // 先获取详情(主要是为了拿最新的评论)
    this.api.getPost(post.id).subscribe({
      next: (fullPost) => {
        this.dialog.open(DetailDialogComponent, {
          maxWidth: '90vw',
          width: '1000px',
          panelClass: 'detail-dialog-container', // 可以自定义样式
          data: { post: fullPost }
        });
      },
      error: () => this.showMsg('无法获取详情')
    });
  }

  onLike(post: Post) {
    const originalLikes = post.likes;
    post.likes = (post.likes || 0) + 1;
    this.api.likePost(post.id).subscribe({
      next: (res) => { if(res.newLikes) post.likes = res.newLikes; },
      error: () => { post.likes = originalLikes; this.showMsg('点赞失败'); }
    });
  }

  onDelete(post: Post) {
    if(confirm('确定要删除这条内容吗？')) {
      this.api.deletePost(post.id).subscribe({
        next: () => {
          this.showMsg('删除成功');
          this.loadPosts();
        },
        error: () => this.showMsg('删除失败')
      });
    }
  }

  private showMsg(msg: string) {
    this.snackBar.open(msg, '关闭', { duration: 3000 });
  }
}