import { neon } from "@neondatabase/serverless";

// Neon Database connection with fallback
const DATABASE_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

// Only initialize if we have a database URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

// Helper function to check if database is available
function isDatabaseAvailable(): boolean {
  return !!sql && !!DATABASE_URL;
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

// Initialize database tables
export async function initDatabase() {
  if (!DATABASE_URL) {
    throw new Error("Database URL not configured");
  }

  if (!sql) {
    throw new Error("Database connection not available");
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

    console.log("✅ Database tables initialized");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
}

// User operations
export async function getUsers(): Promise<User[]> {
  try {
    const users = await sql`SELECT * FROM users ORDER BY created_at DESC`;
    return users as User[];
  } catch (error) {
    console.error("Error getting users:", error);
    return [];
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const users = await sql`SELECT * FROM users WHERE id = ${id}`;
    return (users[0] as User) || null;
  } catch (error) {
    console.error("Error getting user:", error);
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
    console.error("Error creating user:", error);
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
    console.error("Error getting posts:", error);
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
    console.error("Error getting post:", error);
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
    console.error("Error creating post:", error);
    throw error;
  }
}

export async function updatePost(
  id: string,
  updates: Partial<Omit<Post, "id" | "author_id" | "created_at">>
): Promise<Post | null> {
  try {
    // Simple update for common fields
    if (updates.title) {
      const updatedPost = await sql`
        UPDATE posts 
        SET title = ${updates.title}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
      return (updatedPost[0] as Post) || null;
    }

    if (updates.likes !== undefined) {
      const updatedPost = await sql`
        UPDATE posts 
        SET likes = ${updates.likes}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
      return (updatedPost[0] as Post) || null;
    }

    if (updates.views !== undefined) {
      const updatedPost = await sql`
        UPDATE posts 
        SET views = ${updates.views}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
      return (updatedPost[0] as Post) || null;
    }

    if (updates.comments !== undefined) {
      const updatedPost = await sql`
        UPDATE posts 
        SET comments = ${updates.comments}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
      return (updatedPost[0] as Post) || null;
    }

    return null;
  } catch (error) {
    console.error("Error updating post:", error);
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
    console.error("Error incrementing post views:", error);
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
    console.error("Error deleting post:", error);
    return false;
  }
}

// Comment operations
export async function getCommentsByPostId(postId: string): Promise<Comment[]> {
  try {
    const comments = await sql`
      SELECT c.*, u.nickname as author_nickname, u.avatar as author_avatar
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.post_id = ${postId}
      ORDER BY c.created_at DESC
    `;
    return comments as Comment[];
  } catch (error) {
    console.error("Error getting comments:", error);
    return [];
  }
}

export async function createComment(
  comment: Omit<Comment, "id" | "likes" | "created_at" | "updated_at">
): Promise<Comment> {
  try {
    const id = Date.now().toString();
    const newComment = await sql`
      INSERT INTO comments (id, content, post_id, author_id) 
      VALUES (${id}, ${comment.content}, ${comment.post_id}, ${comment.author_id})
      RETURNING *
    `;

    // Update post comment count
    await sql`
      UPDATE posts 
      SET comments = (SELECT COUNT(*) FROM comments WHERE post_id = ${comment.post_id})
      WHERE id = ${comment.post_id}
    `;

    return newComment[0] as Comment;
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
}

// Reaction operations
export async function getReactionsByPostId(
  postId: string
): Promise<Reaction[]> {
  try {
    const reactions = await sql`
      SELECT * FROM reactions 
      WHERE post_id = ${postId}
      ORDER BY created_at DESC
    `;
    return reactions as Reaction[];
  } catch (error) {
    console.error("Error getting reactions:", error);
    return [];
  }
}

export async function toggleReaction(
  postId: string,
  authorId: string,
  type = "LIKE"
): Promise<{ added: boolean; reaction?: Reaction }> {
  try {
    // Check if reaction exists
    const existing = await sql`
      SELECT * FROM reactions 
      WHERE post_id = ${postId} AND author_id = ${authorId}
    `;

    if (existing.length > 0) {
      // Remove reaction
      await sql`
        DELETE FROM reactions 
        WHERE post_id = ${postId} AND author_id = ${authorId}
      `;

      // Update post likes count
      await sql`
        UPDATE posts 
        SET likes = (SELECT COUNT(*) FROM reactions WHERE post_id = ${postId})
        WHERE id = ${postId}
      `;

      return { added: false };
    } else {
      // Add reaction
      const id = Date.now().toString();
      const newReaction = await sql`
        INSERT INTO reactions (id, type, post_id, author_id) 
        VALUES (${id}, ${type}, ${postId}, ${authorId})
        RETURNING *
      `;

      // Update post likes count
      await sql`
        UPDATE posts 
        SET likes = (SELECT COUNT(*) FROM reactions WHERE post_id = ${postId})
        WHERE id = ${postId}
      `;

      return { added: true, reaction: newReaction[0] as Reaction };
    }
  } catch (error) {
    console.error("Error toggling reaction:", error);
    throw error;
  }
}
