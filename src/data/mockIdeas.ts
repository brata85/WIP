export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  rating?: number;
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
  ratings: number[]; // Array of ratings 0.5 - 5.0
  comments: Comment[];
  createdAt: string;
  isNew?: boolean;
  imageUrl?: string;
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
    ratings: [],
    comments: [],
    createdAt: "Just now",
    isNew: true
  }
];

