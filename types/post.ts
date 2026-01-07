export interface PostUser {
    id: number;
    name: string;
    username: string | null;
    image: string | null;
}

export interface PostMedia {
    id: number;
    url: string;
    type: string;
    createdAt: string;
    updatedAt: string;
}

export interface Post {
    id: number;
    userId: number;
    content: string | null;
    createdAt: string;
    updatedAt: string;
    user: PostUser;
    postMedia: PostMedia[];
    _count: {
        comments: number;
        likes: number;
    };
}

export interface PostsResponse {
    message: string;
    posts: Post[];
    pagination: {
        page: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}
