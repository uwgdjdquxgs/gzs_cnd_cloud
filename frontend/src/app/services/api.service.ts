import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly endpoints = {
    GET_ALL: 'https://prod-16.koreacentral.logic.azure.com:443/workflows/230ad18fc28e4230b4d189d5a16e69bf/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=43cNa_br4C75BTLGtHwVPwH0UJHFbM13l4MXVJNxMHo',
    GET_ONE: 'https://prod-13.koreacentral.logic.azure.com:443/workflows/b0585e295a894cc8a461f41e748208ea/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=W_N1g2MLOB4-GtqY1vMBE5w1JRo98ubisg3NfprYGEI',
    ADD: 'https://prod-14.koreacentral.logic.azure.com:443/workflows/5d118c30ac2e4610bc5d4d27d20d35d4/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=88DrMgkRKoDyvHdc_X2kMZhZfLaYONva2Mnz3EXhJX8',
    UPDATE: 'https://prod-22.koreacentral.logic.azure.com:443/workflows/dc0b1b12f1b94703be3eabd5afdb8d1c/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=QRZAdSHEs_ZWjlL12vb0odClghBCBm9HhLwWnwKhG1A',
    DEL: 'https://prod-27.koreacentral.logic.azure.com:443/workflows/d20845c12ebe447aad98c8b0ed765a06/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=yvYyiECIpp5qj8Myf3yQC1_HwHqhKZd8wjSzEcUb2a4',
    UPLOAD: 'https://prod-15.koreacentral.logic.azure.com:443/workflows/0817a48ad9c6493dbba2476e78eb473f/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=BdCMlzci6o0XreVuLDUXrmWrM6_R_cYmqKzjnUmjLks',
    LIKE_BASE: 'https://functionapp0002-ewe8cmcjgghtcmad.koreacentral-01.azurewebsites.net/api/addLike',
    COMMENT_BASE: 'https://functionapp0002-ewe8cmcjgghtcmad.koreacentral-01.azurewebsites.net/api/addComment',
    DEL_COMMENT_BASE: 'https://functionapp0002-ewe8cmcjgghtcmad.koreacentral-01.azurewebsites.net/api/delComment'
  };

  constructor(private http: HttpClient) { }

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.endpoints.GET_ALL);
  }

  getPost(id: string): Observable<Post> {
    return this.http.get<Post>(`${this.endpoints.GET_ONE}&id=${id}`);
  }

  createPost(post: Partial<Post>): Observable<any> {
    return this.http.post(this.endpoints.ADD, post);
  }

  updatePost(post: Partial<Post>): Observable<any> {
    return this.http.post(this.endpoints.UPDATE, post);
  }

  deletePost(id: string): Observable<any> {
    return this.http.post(this.endpoints.DEL, { id });
  }

  likePost(id: string): Observable<any> {
    return this.http.post(`${this.endpoints.LIKE_BASE}/${id}`, {});
  }

  addComment(postId: string, name: string, text: string): Observable<any> {
    return this.http.post(`${this.endpoints.COMMENT_BASE}/${postId}`, { commentName: name, commentText: text });
  }

  deleteComment(postId: string, commentId: string): Observable<any> {
    return this.http.post(`${this.endpoints.DEL_COMMENT_BASE}/${postId}`, { commentId });
  }

  uploadFile(file: File): Observable<string> {
    return new Observable(observer => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64Content = (reader.result as string).split(',')[1];
        const folderName = file.type.startsWith('video') ? 'videos' : 'images';
        const fileName = Date.now() + "_" + file.name;
        
        // 这里的逻辑与之前保持一致，通过 Logic App 上传
        fetch(this.endpoints.UPLOAD, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ fileName, fileContent: base64Content, folder: folderName })
        })
        .then(res => res.json())
        .then(data => {
            observer.next(data.url);
            observer.complete();
        })
        .catch(err => observer.error(err));
      };
      reader.onerror = error => observer.error(error);
    });
  }
}