// Database service with fallback mechanism
// Uses Neon PostgreSQL if available, otherwise falls back to JSON files

import { neon } from "@neondatabase/serverless";
import * as sqliteDB from "./sqlite";

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

// Check if Neon is available
const DATABASE_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
const isNeonAvailable = !!DATABASE_URL;
const sql = isNeonAvailable ? neon(DATABASE_URL) : null;

// Initialize database tables (only for Neon)
export async function initDatabase() {
  if (!isNeonAvailable || !sql) {
    throw new Error("Neon database not configured");
  }

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
  if (!isNeonAvailable || !sql) {
    // Fallback to SQLite/JSON
    const users = await sqliteDB.getUsers();
    return users.map(user => ({
      ...user,
      created_at: user.createdAt
    }));
  }

  try {
    const users = await sql`SELECT * FROM users ORDER BY created_at DESC`;
    return users as User[];
  } catch (error) {
    console.error("Error getting users from Neon:", error);
    return [];
  }
}

export async function getUserById(id: string): Promise<User | null> {
  if (!isNeonAvailable || !sql) {
    // Fallback to SQLite/JSON
    const user = await sqliteDB.getUserById(id);
    return user ? {
      ...user,
      created_at: user.createdAt
    } : null;
  }

  try {
    const users = await sql`SELECT * FROM users WHERE id = ${id}`;
    return (users[0] as User) || null;
  } catch (error) {
    console.error("Error getting user from Neon:", error);
    return null;
  }
}

export async function createUser(user: Omit<User, "created_at">): Promise<User> {
  if (!isNeonAvailable || !sql) {
    // Fallback to SQLite/JSON
    const createdUser = await sqliteDB.createUser({
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar
    });
    return {
      ...createdUser,
      created_at: createdUser.createdAt
    };
  }

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
  if (!isNeonAvailable || !sql) {
    // Fallback to SQLite/JSON
    const posts = await sqliteDB.getPosts();
    return posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      category: post.category,
      tags: post.tags,
      images: post.images,
      likes: post.likes,
      views: post.views,
      comments: post.comments,
      author_id: post.authorId,
      status: post.status,
      excerpt: post.excerpt,
      created_at: post.createdAt,
      updated_at: post.updatedAt
    }));
  }

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
  if (!isNeonAvailable || !sql) {
    // Fallback to SQLite/JSON
    const post = await sqliteDB.getPostById(id);
    return post ? {
      id: post.id,
      title: post.title,
      content: post.content,
      category: post.category,
      tags: post.tags,
      images: post.images,
      likes: post.likes,
      views: post.views,
      comments: post.comments,
      author_id: post.authorId,
      status: post.status,
      excerpt: post.excerpt,
      created_at: post.createdAt,
      updated_at: post.updatedAt
    } : null;
  }

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
  post: Omit<Post, "id" | "likes" | "views" | "comments" | "created_at" | "updated_at">
): Promise<Post> {
  if (!isNeonAvailable || !sql) {
    // Fallback to SQLite/JSON
    const createdPost = await sqliteDB.createPost({
      title: post.title,
      content: post.content,
      category: post.category,
      tags: post.tags,
      images: post.images,
      status: post.status,
      authorId: post.author_id,
      excerpt: post.excerpt
    });
    return {
      id: createdPost.id,
      title: createdPost.title,
      content: createdPost.content,
      category: createdPost.category,
      tags: createdPost.tags,
      images: createdPost.images,
      likes: createdPost.likes,
      views: createdPost.views,
      comments: createdPost.comments,
      author_id: createdPost.authorId,
      status: createdPost.status,
      excerpt: createdPost.excerpt,
      created_at: createdPost.createdAt,
      updated_at: createdPost.updatedAt
    };
  }

  try {
    const id = Date.now().toString();
    const newPost = await sql`
      INSERT INTO posts (id, title, content, category, tags, images, author_id, status, excerpt) 
      VALUES (${id}, ${post.title}, ${post.content}, ${post.category}, ${post.tags || []}, ${post.images || []}, ${post.author_id}, ${post.status || "published"}, ${post.excerpt || ""})
      RETURNING *
    `;
    return newPost[0] as Post;
  } catch (error) {
    console.error("Error creating post in Neon:", error);
    throw error;
  }
}

// Simplified update function for common use cases
export async function updatePost(id: string, updates: { likes?: number; views?: number; comments?: number }): Promise<Post | null> {
  if (!isNeonAvailable || !sql) {
    // Fallback to SQLite/JSON
    const updatedPost = await sqliteDB.updatePost(id, updates);
    return updatedPost ? {
      id: updatedPost.id,
      title: updatedPost.title,
      content: updatedPost.content,
      category: updatedPost.category,
      tags: updatedPost.tags,
      images: updatedPost.images,
      likes: updatedPost.likes,
      views: updatedPost.views,
      comments: updatedPost.comments,
      author_id: updatedPost.authorId,
      status: updatedPost.status,
      excerpt: updatedPost.excerpt,
      created_at: updatedPost.createdAt,
      updated_at: updatedPost.updatedAt
    } : null;
  }

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
  if (!isNeonAvailable || !sql) {
    // Fallback to SQLite/JSON
    await sqliteDB.incrementPostViews(id);
    return;
  }

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
  if (!isNeonAvailable || !sql) {
    // Fallback to SQLite/JSON
    return await sqliteDB.deletePost(id);
  }

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

// Export database status
export const isDatabaseReady = isNeonAvailable;
export const databaseType = isNeonAvailable ? 'Neon PostgreSQL' : 'JSON Files';
