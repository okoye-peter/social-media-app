export interface Comment {
    id: number;
    userId: number;
    postId: number;
    content: string;
    createdAt: string;
    updatedAt: string;
    user: {
        id: number;
        name: string;
        username: string | null;
        image: string | null;
    };
}

export interface CommentsResponse {
    message: string;
    comments: Comment[];
}
