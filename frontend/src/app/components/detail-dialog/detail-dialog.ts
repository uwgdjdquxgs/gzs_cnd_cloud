import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { Post, Comment } from '../../models/post.model';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-detail-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, 
    MatButtonModule, MatIconModule, MatListModule, MatInputModule
  ],
  templateUrl: './detail-dialog.html',
  styleUrls: ['./detail-dialog.scss']
})
export class DetailDialogComponent {
  post: Post;
  newCommentName = '';
  newCommentText = '';
  submitting = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: ApiService
  ) {
    this.post = data.post;
  }

  addComment() {
    if (!this.newCommentName || !this.newCommentText) return;
    this.submitting = true;

    this.api.addComment(this.post.id, this.newCommentName, this.newCommentText)
      .subscribe({
        next: () => {
          // 刷新数据（这里简单处理：手动push到数组，实现伪实时更新）
          const newComment: Comment = {
            commentId: Date.now().toString(), // 临时ID
            commentName: this.newCommentName,
            commentText: this.newCommentText,
            commentTime: new Date().toISOString()
          };
          if (!this.post.comments) this.post.comments = [];
          this.post.comments.push(newComment);
          
          this.newCommentText = ''; // 只清空内容，留着名字方便继续发
          this.submitting = false;
        },
        error: () => {
          alert('评论失败');
          this.submitting = false;
        }
      });
  }

  deleteComment(commentId: string) {
    if(!confirm('删除此评论？')) return;
    
    this.api.deleteComment(this.post.id, commentId).subscribe({
      next: () => {
        this.post.comments = this.post.comments.filter(c => c.commentId !== commentId);
      },
      error: () => alert('删除失败')
    });
  }
}