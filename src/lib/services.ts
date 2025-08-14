import { db } from "./database";
import { users, posts, comments, reactions, categories } from "./schema";
import type { User, NewUser, Post, NewPost, Comment, NewComment } from "./schema";
import { eq, desc, sql, and, or, ilike } from "drizzle-orm";

// User operations
export class UserService {
  static async create(userData: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  static async findById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || null;
  }

  static async findByNickname(nickname: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.nickname, nickname));
    return user || null;
  }

  static async update(id: string, userData: Partial<NewUser>): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }
}

// Post operations
export class PostService {
  static async create(postData: NewPost): Promise<Post> {
    const [post] = await db.insert(posts).values(postData).returning();
    return post;
  }

  static async findById(id: string): Promise<Post | null> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post || null;
  }

  static async findAll(options: {
    limit?: number;
    offset?: number;
    category?: string;
    authorId?: string;
    status?: string;
  } = {}): Promise<{ posts: Post[]; total: number }> {
    const { limit = 10, offset = 0, category, authorId, status = "published" } = options;

    let query = db.select().from(posts).where(eq(posts.status, status));

    if (category) {
      query = query.where(eq(posts.category, category));
    }

    if (authorId) {
      query = query.where(eq(posts.authorId, authorId));
    }

    const postsResult = await query
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(eq(posts.status, status));

    return {
      posts: postsResult,
      total: count,
    };
  }

  static async search(searchTerm: string): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(
        and(
          eq(posts.status, "published"),
          or(
            ilike(posts.title, `%${searchTerm}%`),
            ilike(posts.content, `%${searchTerm}%`),
            ilike(posts.excerpt, `%${searchTerm}%`)
          )
        )
      )
      .orderBy(desc(posts.createdAt))
      .limit(20);
  }

  static async update(id: string, postData: Partial<NewPost>): Promise<Post | null> {
    const [post] = await db
      .update(posts)
      .set({ ...postData, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();
    return post || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.id, id));
    return result.rowCount > 0;
  }

  static async incrementViews(id: string): Promise<void> {
    await db
      .update(posts)
      .set({ views: sql`${posts.views} + 1` })
      .where(eq(posts.id, id));
  }

  static async updateStats(postId: string): Promise<void> {
    // Update likes count
    const [{ likesCount }] = await db
      .select({ likesCount: sql<number>`count(*)` })
      .from(reactions)
      .where(and(eq(reactions.postId, postId), eq(reactions.type, "LIKE")));

    // Update comments count
    const [{ commentsCount }] = await db
      .select({ commentsCount: sql<number>`count(*)` })
      .from(comments)
      .where(eq(comments.postId, postId));

    await db
      .update(posts)
      .set({
        likes: likesCount,
        commentsCount: commentsCount,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId));
  }
}

// Comment operations
export class CommentService {
  static async create(commentData: NewComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(commentData).returning();
    
    // Update post comments count
    await PostService.updateStats(commentData.postId);
    
    return comment;
  }

  static async findByPostId(postId: string): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));
  }

  static async findById(id: string): Promise<Comment | null> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment || null;
  }

  static async update(id: string, commentData: Partial<NewComment>): Promise<Comment | null> {
    const [comment] = await db
      .update(comments)
      .set({ ...commentData, updatedAt: new Date() })
      .where(eq(comments.id, id))
      .returning();
    return comment || null;
  }

  static async delete(id: string): Promise<boolean> {
    const comment = await this.findById(id);
    if (!comment) return false;

    const result = await db.delete(comments).where(eq(comments.id, id));
    
    // Update post stats
    if (comment.postId) {
      await PostService.updateStats(comment.postId);
    }

    return result.rowCount > 0;
  }
}

// Reaction operations
export class ReactionService {
  static async toggle(reactionData: {
    postId?: string;
    commentId?: string;
    authorId: string;
    type: string;
  }): Promise<{ added: boolean; reaction?: any }> {
    const { postId, commentId, authorId, type } = reactionData;

    // Check if reaction already exists
    const whereClause = commentId
      ? and(eq(reactions.commentId, commentId), eq(reactions.authorId, authorId))
      : and(eq(reactions.postId, postId!), eq(reactions.authorId, authorId));

    const [existingReaction] = await db
      .select()
      .from(reactions)
      .where(whereClause);

    if (existingReaction) {
      // Remove reaction
      await db.delete(reactions).where(eq(reactions.id, existingReaction.id));
      
      // Update stats
      if (postId) {
        await PostService.updateStats(postId);
      }

      return { added: false };
    } else {
      // Add reaction
      const [newReaction] = await db
        .insert(reactions)
        .values({
          postId,
          commentId,
          authorId,
          type,
        })
        .returning();

      // Update stats
      if (postId) {
        await PostService.updateStats(postId);
      }

      return { added: true, reaction: newReaction };
    }
  }

  static async getByPostId(postId: string): Promise<any[]> {
    return await db
      .select()
      .from(reactions)
      .where(eq(reactions.postId, postId));
  }
}
