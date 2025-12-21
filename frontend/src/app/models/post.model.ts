export interface Comment {
  commentId: string;
  commentName: string;
  commentText: string;
  commentTime: string;
}

export interface Post {
  id: string;
  header: string;
  text: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  createdAt: string;
  likes: number;
  comments: Comment[];
}