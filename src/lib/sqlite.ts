import { promises as fs } from "fs";
import path from "path";

// Database file paths
const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const POSTS_FILE = path.join(DATA_DIR, "posts.json");
const COMMENTS_FILE = path.join(DATA_DIR, "comments.json");
const REACTIONS_FILE = path.join(DATA_DIR, "reactions.json");

// Types
export interface User {
  id: string;
  nickname: string;
  avatar: string;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  images: string[];
  likes: number;
  views: number;
  comments: number;
  authorId: string;
  status: string;
  excerpt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  likes: number;
  postId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reaction {
  id: string;
  type: string;
  postId: string;
  authorId: string;
  createdAt: string;
}

// Ensure data directory and files exist
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function ensureFile(filePath: string) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, "[]", "utf8");
  }
}

// Generic database operations
async function readTable<T>(filePath: string): Promise<T[]> {
  await ensureDataDir();
  await ensureFile(filePath);

  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeTable<T>(filePath: string, data: T[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

// User operations
export async function getUsers(): Promise<User[]> {
  return readTable<User>(USERS_FILE);
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((user) => user.id === id) || null;
}

export async function createUser(user: Omit<User, "createdAt">): Promise<User> {
  const users = await getUsers();
  const newUser: User = {
    ...user,
    createdAt: new Date().toISOString(),
  };

  // Check if user already exists
  const existingUser = users.find((u) => u.id === user.id);
  if (existingUser) {
    return existingUser;
  }

  users.push(newUser);
  await writeTable(USERS_FILE, users);
  return newUser;
}

// Post operations
export async function getPosts(): Promise<Post[]> {
  return readTable<Post>(POSTS_FILE);
}

export async function getPostById(id: string): Promise<Post | null> {
  const posts = await getPosts();
  return posts.find((post) => post.id === id) || null;
}

export async function createPost(
  post: Omit<
    Post,
    "id" | "likes" | "views" | "comments" | "createdAt" | "updatedAt"
  >
): Promise<Post> {
  const posts = await getPosts();
  const newPost: Post = {
    ...post,
    id: Date.now().toString(),
    likes: 0,
    views: 0,
    comments: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  posts.unshift(newPost);
  await writeTable(POSTS_FILE, posts);
  return newPost;
}

export async function updatePost(
  id: string,
  updates: Partial<Omit<Post, "id" | "authorId" | "createdAt">>
): Promise<Post | null> {
  const posts = await getPosts();
  const postIndex = posts.findIndex((post) => post.id === id);

  if (postIndex === -1) {
    return null;
  }

  const updatedPost: Post = {
    ...posts[postIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  posts[postIndex] = updatedPost;
  await writeTable(POSTS_FILE, posts);
  return updatedPost;
}

export async function incrementPostViews(id: string): Promise<void> {
  const posts = await getPosts();
  const postIndex = posts.findIndex((post) => post.id === id);

  if (postIndex !== -1) {
    posts[postIndex].views = (posts[postIndex].views || 0) + 1;
    posts[postIndex].updatedAt = new Date().toISOString();
    await writeTable(POSTS_FILE, posts);
  }
}

export async function updatePostCommentCount(postId: string): Promise<void> {
  const comments = await getCommentsByPostId(postId);
  const posts = await getPosts();
  const postIndex = posts.findIndex((post) => post.id === postId);

  if (postIndex !== -1) {
    posts[postIndex].comments = comments.length;
    posts[postIndex].updatedAt = new Date().toISOString();
    await writeTable(POSTS_FILE, posts);
  }
}

export async function deletePost(id: string): Promise<boolean> {
  const posts = await getPosts();
  const postIndex = posts.findIndex((post) => post.id === id);

  if (postIndex === -1) return false;

  posts.splice(postIndex, 1);
  await writeTable(POSTS_FILE, posts);

  // Also delete related comments and reactions
  await deleteCommentsByPostId(id);
  await deleteReactionsByPostId(id);

  return true;
}

// Comment operations
export async function getComments(): Promise<Comment[]> {
  return readTable<Comment>(COMMENTS_FILE);
}

export async function getCommentsByPostId(postId: string): Promise<Comment[]> {
  const comments = await getComments();
  return comments.filter((comment) => comment.postId === postId);
}

export async function createComment(
  comment: Omit<Comment, "id" | "likes" | "createdAt" | "updatedAt">
): Promise<Comment> {
  const comments = await getComments();
  const newComment: Comment = {
    ...comment,
    id: Date.now().toString(),
    likes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  comments.unshift(newComment);
  await writeTable(COMMENTS_FILE, comments);
  return newComment;
}

export async function deleteCommentsByPostId(postId: string): Promise<void> {
  const comments = await getComments();
  const filteredComments = comments.filter(
    (comment) => comment.postId !== postId
  );
  await writeTable(COMMENTS_FILE, filteredComments);
}

// Reaction operations
export async function getReactions(): Promise<Reaction[]> {
  return readTable<Reaction>(REACTIONS_FILE);
}

export async function getReactionsByPostId(
  postId: string
): Promise<Reaction[]> {
  const reactions = await getReactions();
  return reactions.filter((reaction) => reaction.postId === postId);
}

export async function toggleReaction(
  postId: string,
  authorId: string,
  type = "LIKE"
): Promise<{ added: boolean; reaction?: Reaction }> {
  const reactions = await getReactions();
  const existingReactionIndex = reactions.findIndex(
    (r) => r.postId === postId && r.authorId === authorId
  );

  if (existingReactionIndex !== -1) {
    // Remove existing reaction
    reactions.splice(existingReactionIndex, 1);
    await writeTable(REACTIONS_FILE, reactions);

    // Update post likes count
    await updatePostLikesCount(postId);

    return { added: false };
  } else {
    // Add new reaction
    const newReaction: Reaction = {
      id: Date.now().toString(),
      type,
      postId,
      authorId,
      createdAt: new Date().toISOString(),
    };

    reactions.push(newReaction);
    await writeTable(REACTIONS_FILE, reactions);

    // Update post likes count
    await updatePostLikesCount(postId);

    return { added: true, reaction: newReaction };
  }
}

export async function deleteReactionsByPostId(postId: string): Promise<void> {
  const reactions = await getReactions();
  const filteredReactions = reactions.filter(
    (reaction) => reaction.postId !== postId
  );
  await writeTable(REACTIONS_FILE, filteredReactions);
}

// Helper function to update post likes count
async function updatePostLikesCount(postId: string): Promise<void> {
  const reactions = await getReactionsByPostId(postId);
  const likesCount = reactions.length;
  await updatePost(postId, { likes: likesCount });
}
