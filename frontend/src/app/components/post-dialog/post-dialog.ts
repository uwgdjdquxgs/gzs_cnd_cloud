import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Post } from '../../models/post.model';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-post-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, 
    MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule
  ],
  templateUrl: './post-dialog.html',
  styleUrls: ['./post-dialog.scss']
})
export class PostDialogComponent {
  post: Partial<Post> = { header: '', text: '', mediaType: 'image' };
  isEdit = false;
  previewUrl: string | null = null;
  selectedFile: File | null = null;
  uploading = false;

  constructor(
    public dialogRef: MatDialogRef<PostDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: ApiService
  ) {
    if (data && data.post) {
      this.isEdit = true;
      this.post = { ...data.post }; // 复制一份，避免直接修改原数据
      this.previewUrl = this.post.mediaUrl || null;
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.post.mediaType = file.type.startsWith('video') ? 'video' : 'image';
      
      // 生成本地预览
      const reader = new FileReader();
      reader.onload = (e: any) => this.previewUrl = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  async save() {
    if (!this.post.header || !this.post.text) return;
    this.uploading = true;

    try {
      // 1. 如果有新文件，先上传
      if (this.selectedFile) {
        this.post.mediaUrl = await this.uploadApiWrapper(this.selectedFile);
      }

      // 2. 这里的 createPost/updatePost 需要返回 Observable，我们转 Promise 处理
      const action$ = this.isEdit 
        ? this.api.updatePost(this.post) 
        : this.api.createPost(this.post);

      action$.subscribe({
        next: () => {
          this.uploading = false;
          this.dialogRef.close(true); // 返回 true 表示操作成功
        },
        error: (err) => {
          console.error(err);
          this.uploading = false;
          alert('提交失败，请重试');
        }
      });
    } catch (err) {
      this.uploading = false;
      alert('文件上传失败');
    }
  }

  // 辅助：把 Observable 转 Promise
  private uploadApiWrapper(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      this.api.uploadFile(file).subscribe({
        next: (url) => resolve(url),
        error: (err) => reject(err)
      });
    });
  }
}