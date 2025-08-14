#!/usr/bin/env node

/**
 * Script để migrate từ JSON files sang Neon PostgreSQL
 * Chạy lệnh: node scripts/migrate-to-neon.js
 */

import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateToNeon() {
  const DATABASE_URL = process.env.NEON_DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.error('❌ Không tìm thấy NEON_DATABASE_URL');
    console.log('💡 Hướng dẫn:');
    console.log('1. Tạo Neon database tại: https://neon.tech');
    console.log('2. Copy connection string');
    console.log('3. Thêm vào .env.local: NEON_DATABASE_URL="postgresql://..."');
    process.exit(1);
  }

  const sql = neon(DATABASE_URL);
  
  try {
    console.log('🚀 Bắt đầu migration từ JSON sang Neon PostgreSQL...');
    
    // Tạo bảng users
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        nickname TEXT NOT NULL,
        avatar TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Tạo bảng posts
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
    
    // Tạo bảng comments
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
    
    // Tạo bảng reactions
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
    
    console.log('✅ Tạo bảng thành công');
    
    // Migrate dữ liệu từ JSON files
    const dataDir = path.join(__dirname, '../data');
    
    // Migrate users
    if (fs.existsSync(path.join(dataDir, 'users.json'))) {
      const users = JSON.parse(fs.readFileSync(path.join(dataDir, 'users.json'), 'utf8'));
      for (const user of users) {
        await sql`
          INSERT INTO users (id, nickname, avatar, created_at) 
          VALUES (${user.id}, ${user.nickname}, ${user.avatar}, ${user.createdAt})
          ON CONFLICT (id) DO NOTHING
        `;
      }
      console.log(`✅ Migrated ${users.length} users`);
    }
    
    // Migrate posts
    if (fs.existsSync(path.join(dataDir, 'posts.json'))) {
      const posts = JSON.parse(fs.readFileSync(path.join(dataDir, 'posts.json'), 'utf8'));
      for (const post of posts) {
        await sql`
          INSERT INTO posts (id, title, content, category, tags, images, likes, views, comments, author_id, status, excerpt, created_at, updated_at) 
          VALUES (${post.id}, ${post.title}, ${post.content}, ${post.category}, ${post.tags || []}, ${post.images || []}, ${post.likes || 0}, ${post.views || 0}, ${post.comments || 0}, ${post.authorId}, ${post.status || 'published'}, ${post.excerpt || ''}, ${post.createdAt}, ${post.updatedAt})
          ON CONFLICT (id) DO NOTHING
        `;
      }
      console.log(`✅ Migrated ${posts.length} posts`);
    }
    
    // Migrate comments
    if (fs.existsSync(path.join(dataDir, 'comments.json'))) {
      const comments = JSON.parse(fs.readFileSync(path.join(dataDir, 'comments.json'), 'utf8'));
      for (const comment of comments) {
        await sql`
          INSERT INTO comments (id, content, likes, post_id, author_id, created_at, updated_at) 
          VALUES (${comment.id}, ${comment.content}, ${comment.likes || 0}, ${comment.postId}, ${comment.authorId}, ${comment.createdAt}, ${comment.updatedAt})
          ON CONFLICT (id) DO NOTHING
        `;
      }
      console.log(`✅ Migrated ${comments.length} comments`);
    }
    
    // Migrate reactions
    if (fs.existsSync(path.join(dataDir, 'reactions.json'))) {
      const reactions = JSON.parse(fs.readFileSync(path.join(dataDir, 'reactions.json'), 'utf8'));
      for (const reaction of reactions) {
        await sql`
          INSERT INTO reactions (id, type, post_id, author_id, created_at) 
          VALUES (${reaction.id}, ${reaction.type || 'LIKE'}, ${reaction.postId}, ${reaction.authorId}, ${reaction.createdAt})
          ON CONFLICT (post_id, author_id) DO NOTHING
        `;
      }
      console.log(`✅ Migrated ${reactions.length} reactions`);
    }
    
    console.log('🎉 Migration sang Neon hoàn tất!');
    console.log('📝 Tiếp theo:');
    console.log('1. Update API routes để sử dụng Neon thay vì JSON');
    console.log('2. Test local: npm run dev');
    console.log('3. Deploy lên Vercel với environment variables');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateToNeon();
