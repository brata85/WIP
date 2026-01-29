export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface Idea {
  id: string;
  title: string;
  author: string;
  authorHandle: string;
  description: string;
  tags: string[];
  likes: number;
  dislikes: number;
  comments: Comment[];
  createdAt: string;
  isNew?: boolean;
  imageUrl?: string; // Deprecated, use images
  images?: string[];
}


export const MOCK_IDEAS: Idea[] = [
  {
    id: "test-1",
    title: "testtesttest",
    author: "You",
    authorHandle: "@you",
    description: "testtesttesttest",
    tags: ["live"],
    likes: 0,
    dislikes: 0,
    comments: [],
    createdAt: "Just now",
    isNew: true
  }
];

