# Blog Nội Trợ - Cộng đồng chia sẻ kinh nghiệm

Một ứng dụng blog dành cho cộng đồng nội trợ Việt Nam, nơi mọi người có thể chia sẻ kinh nghiệm, mẹo hay trong nấu ăn, chăm sóc gia đình và cuộc sống hàng ngày.

## 🌟 Tính năng chính

### ✅ Đã hoàn thành

- **Giao diện trang chủ**: Thiết kế đẹp mắt, thân thiện với người dùng
- **Hệ thống xác thực**: Đăng nhập/đăng ký với NextAuth.js
- **Cơ sở dữ liệu**: Kết nối MongoDB với Mongoose
- **Models**: User, Post, Comment với đầy đủ tính năng
- **API Routes**: Authentication và registration

### 🚧 Đang phát triển

- **Đăng bài viết**: Tạo, chỉnh sửa, xóa bài viết
- **Upload hình ảnh**: Đăng hình ảnh kèm bài viết
- **Hệ thống comment**: Bình luận và trả lời
- **Reactions**: Like, heart cho bài viết và comment
- **Phân loại**: Categories và tags
- **Tìm kiếm**: Tìm kiếm bài viết theo từ khóa

## 🛠 Công nghệ sử dụng

- **Framework**: Next.js 15 với App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB với Mongoose ODM
- **Authentication**: NextAuth.js v5
- **Icons**: Lucide React
- **UI Components**: Custom components với Tailwind

## 📦 Cài đặt

1. **Clone repository**:

   ```bash
   git clone <repository-url>
   cd blog_chef
   ```

2. **Cài đặt dependencies**:

   ```bash
   npm install
   ```

3. **Thiết lập biến môi trường**:
   Tạo file `.env.local` và thêm:

   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-change-this-in-production
   MONGODB_URI=mongodb://localhost:27017/blog_chef
   ```

4. **Khởi động MongoDB**:
   Đảm bảo MongoDB đang chạy trên máy local hoặc sử dụng MongoDB Atlas

5. **Chạy ứng dụng**:

   ```bash
   npm run dev
   ```

6. **Truy cập**: Mở [http://localhost:3000](http://localhost:3000)

## 🎯 Mục tiêu dự án

### Dành cho cộng đồng nội trợ

- **Chia sẻ kinh nghiệm**: Nấu ăn, chăm sóc nhà cửa, nuôi dạy con
- **Kết nối**: Tạo cộng đồng hỗ trợ lẫn nhau
- **Học hỏi**: Trao đổi mẹo hay, bí quyết thực tế
- **Inspiration**: Truyền cảm hứng cho cuộc sống gia đình

### Tính năng đặc biệt

- **Giao diện thân thiện**: Dễ sử dung cho mọi lứa tuổi
- **Categories đa dạng**: Nấu ăn, chăm sóc nhà, nuôi con, làm đẹp
- **Tương tác cao**: Comment, reaction, share
- **Responsive**: Hoạt động tốt trên mọi thiết bị

## 📁 Cấu trúc dự án

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/
│   │       └── register/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/
│       └── input.tsx
├── lib/
│   ├── auth.ts
│   ├── mongodb.ts
│   └── utils.ts
├── models/
│   ├── User.ts
│   ├── Post.ts
│   └── Comment.ts
└── types/
    └── next-auth.d.ts
```

## 🎨 Design System

### Colors

- **Primary**: Pink (500, 600) - Ấm áp, thân thiện
- **Secondary**: Orange (400, 500) - Năng động, tích cực
- **Accent**: Blue, Purple - Đa dạng categories
- **Neutral**: Gray scale - Text và backgrounds

### Typography

- **Font**: Geist Sans - Modern, readable
- **Hierarchy**: Clear heading structure
- **Vietnamese**: Fully support Vietnamese characters

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run build
# Deploy to Vercel
```

### Environment Variables

Đảm bảo thiết lập các biến môi trường trên production:

- `NEXTAUTH_URL`: Production URL
- `NEXTAUTH_SECRET`: Strong secret key
- `MONGODB_URI`: MongoDB connection string

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

Dự án này được phát hành dưới MIT License. Xem file `LICENSE` để biết thêm chi tiết.

## 👥 Credits

- **UI/UX**: Inspired by modern blog designs
- **Icons**: Lucide React
- **Fonts**: Vercel Geist family

---

**Blog Nội Trợ** - Kết nối và chia sẻ cùng cộng đồng nội trợ Việt Nam 🇻🇳
