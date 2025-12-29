import { NextRequest, NextResponse } from 'next/server';

export interface Comment {
  id: string;
  jokeIndex: number;
  userId: string;
  username: string;
  text: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
}

// In-memory storage (in production, use a database)
// This is a simple in-memory store for demo purposes
let commentsStore: Comment[] = [];

// Load comments from in-memory store
// In production, use a proper database
function getComments(): Comment[] {
  return commentsStore;
}

function saveComments(newComments: Comment[]) {
  commentsStore = newComments;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const jokeIndex = searchParams.get('jokeIndex');

  const allComments = getComments();
  
  if (jokeIndex !== null) {
    const jokeComments = allComments.filter(c => c.jokeIndex === parseInt(jokeIndex));
    return NextResponse.json(jokeComments);
  }

  return NextResponse.json(allComments);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jokeIndex, userId, username, text } = body;

    if (!jokeIndex || !userId || !username || !text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const allComments = getComments();
    const newComment: Comment = {
      id: Date.now().toString(),
      jokeIndex: parseInt(jokeIndex),
      userId,
      username,
      text,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: []
    };

    allComments.push(newComment);
    saveComments(allComments);

    return NextResponse.json(newComment);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}

