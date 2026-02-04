export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface IdeaContent {
  planning: string;
  details: string;
  roadmap: string;
}

export interface Idea {
  id: string;
  title: string;
  author: string;
  authorHandle: string;
  content: IdeaContent;
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
    content: {
      planning: "This project aims to solve the problem of...",
      details: "testtesttesttest",
      roadmap: "Phase 1: Launch MVP\nPhase 2: User feedback"
    },
    tags: ["live"],
    likes: 0,
    dislikes: 0,
    comments: [],
    createdAt: "Just now",
    isNew: true
  }
];

