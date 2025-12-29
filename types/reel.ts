export interface Reel {
  id: string;
  jokeId: string;
  question: string;
  answer: string;
  status: 'draft' | 'generating' | 'completed' | 'error';
  videoUrl?: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

