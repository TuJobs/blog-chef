// Database service using Neon PostgreSQL
// Simplified to use only Neon database

import { neon } from "@neondatabase/serverless";

// Disable SSL certificate validation for development
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Types
export interface User {
  id: string;
  nickname: string;
  avatar: string;
  created_at: string;
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
  author_id: string;
  status: string;
  excerpt?: string;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  content: string;
  likes: number;
  post_id: string;
  author_id: string;
  created_at: string;
  updated_at: string;
}

export interface Reaction {
  id: string;
  type: string;
  post_id: string;
  author_id: string;
  created_at: string;
}

// Initialize Neon database connection
const DATABASE_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("NEON_DATABASE_URL environment variable is required");
}
const sql = neon(DATABASE_URL);

// Initialize database tables
export async function initDatabase() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        nickname TEXT NOT NULL,
        avatar TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create posts table
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        tags TEXT[] DEFAULT '{}',
        images TEXT[] DEFAULT '{}',
        likes INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        author_id TEXT NOT NULL,
        status TEXT DEFAULT 'published',
        excerpt TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create comments table
    await sql`
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        likes INTEGER DEFAULT 0,
        post_id TEXT NOT NULL,
        author_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create reactions table
    await sql`
      CREATE TABLE IF NOT EXISTS reactions (
        id TEXT PRIMARY KEY,
        type TEXT DEFAULT 'LIKE',
        post_id TEXT NOT NULL,
        author_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, author_id)
      )
    `;

    console.log("✅ Neon database tables initialized");
  } catch (error) {
    console.error("❌ Neon database initialization failed:", error);
    throw error;
  }
}

// User operations
export async function getUsers(): Promise<User[]> {
  try {
    const users = await sql`SELECT * FROM users ORDER BY created_at DESC`;
    return users as User[];
  } catch (error) {
    console.error("Error getting users from Neon:", error);
    return [];
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const users = await sql`SELECT * FROM users WHERE id = ${id}`;
    return (users[0] as User) || null;
  } catch (error) {
    console.error("Error getting user from Neon:", error);
    return null;
  }
}

export async function createUser(
  user: Omit<User, "created_at">
): Promise<User> {
  try {
    const newUser = await sql`
      INSERT INTO users (id, nickname, avatar) 
      VALUES (${user.id}, ${user.nickname}, ${user.avatar})
      ON CONFLICT (id) DO UPDATE SET 
        nickname = EXCLUDED.nickname,
        avatar = EXCLUDED.avatar
      RETURNING *
    `;
    return newUser[0] as User;
  } catch (error) {
    console.error("Error creating user in Neon:", error);
    throw error;
  }
}

// Post operations
export async function getPosts(): Promise<Post[]> {
  try {
    const posts = await sql`
      SELECT p.*, u.nickname as author_nickname, u.avatar as author_avatar
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      ORDER BY p.created_at DESC
    `;
    return posts as Post[];
  } catch (error) {
    console.error("Error getting posts from Neon:", error);
    return [];
  }
}

export async function getPostById(id: string): Promise<Post | null> {
  try {
    const posts = await sql`
      SELECT p.*, u.nickname as author_nickname, u.avatar as author_avatar
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.id = ${id}
    `;
    return (posts[0] as Post) || null;
  } catch (error) {
    console.error("Error getting post from Neon:", error);
    return null;
  }
}

export async function createPost(
  post: Omit<
    Post,
    "id" | "likes" | "views" | "comments" | "created_at" | "updated_at"
  >
): Promise<Post> {
  try {
    const id = Date.now().toString();
    const newPost = await sql`
      INSERT INTO posts (id, title, content, category, tags, images, author_id, status, excerpt) 
      VALUES (${id}, ${post.title}, ${post.content}, ${post.category}, ${
      post.tags || []
    }, ${post.images || []}, ${post.author_id}, ${
      post.status || "published"
    }, ${post.excerpt || ""})
      RETURNING *
    `;
    return newPost[0] as Post;
  } catch (error) {
    console.error("Error creating post in Neon:", error);
    throw error;
  }
}

// Simplified update function for common use cases
export async function updatePost(
  id: string,
  updates: { likes?: number; views?: number; comments?: number }
): Promise<Post | null> {
  try {
    if (updates.likes !== undefined) {
      const result = await sql`
        UPDATE posts 
        SET likes = ${updates.likes}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
      return (result[0] as Post) || null;
    }

    if (updates.views !== undefined) {
      const result = await sql`
        UPDATE posts 
        SET views = ${updates.views}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
      return (result[0] as Post) || null;
    }

    if (updates.comments !== undefined) {
      const result = await sql`
        UPDATE posts 
        SET comments = ${updates.comments}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
      return (result[0] as Post) || null;
    }

    return null;
  } catch (error) {
    console.error("Error updating post in Neon:", error);
    return null;
  }
}

export async function incrementPostViews(id: string): Promise<void> {
  try {
    await sql`
      UPDATE posts 
      SET views = views + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error("Error incrementing post views in Neon:", error);
  }
}

export async function deletePost(id: string): Promise<boolean> {
  try {
    // Delete related comments and reactions first
    await sql`DELETE FROM comments WHERE post_id = ${id}`;
    await sql`DELETE FROM reactions WHERE post_id = ${id}`;

    // Delete the post
    const result = await sql`DELETE FROM posts WHERE id = ${id}`;
    return result.length === 0; // If no rows returned, deletion successful
  } catch (error) {
    console.error("Error deleting post in Neon:", error);
    return false;
  }
}

// Comment operations
export async function getComments(): Promise<Comment[]> {
  try {
    const comments = await sql`SELECT * FROM comments ORDER BY created_at DESC`;
    return comments as Comment[];
  } catch (error) {
    console.error("Error getting comments from Neon:", error);
    return [];
  }
}

// Reaction operations
export async function getReactions(): Promise<Reaction[]> {
  try {
    const reactions = await sql`SELECT * FROM reactions ORDER BY created_at DESC`;
    return reactions as Reaction[];
  } catch (error) {
    console.error("Error getting reactions from Neon:", error);
    return [];
  }
}

// Export database status
export const isDatabaseReady = true;
export const databaseType = "Neon PostgreSQL";
