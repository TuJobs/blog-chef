#!/bin/bash

# Script kiểm tra lỗi cho Blog Chef
echo "🔍 Đang kiểm tra lỗi Blog Chef..."
echo "=================================="

# Kiểm tra directory hiện tại
if [ ! -f "package.json" ]; then
    echo "❌ LỖI: Không tìm thấy package.json"
    echo "Vui lòng chạy script này từ thư mục gốc của dự án"
    exit 1
fi

echo "✅ Đang ở đúng thư mục dự án"

# Kiểm tra node_modules
if [ ! -d "node_modules" ]; then
    echo "❌ LỖI: Không tìm thấy node_modules"
    echo "Đang cài đặt dependencies..."
    npm install
fi

echo "✅ Dependencies đã được cài đặt"

# Kiểm tra build
echo "🔨 Đang kiểm tra build..."
npm run build > build.log 2>&1
BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo "✅ Build thành công"
else
    echo "❌ LỖI BUILD:"
    cat build.log
    exit 1
fi

# Kiểm tra type checking
echo "📝 Đang kiểm tra TypeScript..."
npm run type-check > typecheck.log 2>&1
TYPE_EXIT_CODE=$?

if [ $TYPE_EXIT_CODE -eq 0 ]; then
    echo "✅ TypeScript OK"
else
    echo "⚠️  TypeScript có warnings:"
    cat typecheck.log
fi

# Kiểm tra linting
echo "🧹 Đang kiểm tra ESLint..."
npm run lint > lint.log 2>&1
LINT_EXIT_CODE=$?

if [ $LINT_EXIT_CODE -eq 0 ]; then
    echo "✅ ESLint OK"
else
    echo "⚠️  ESLint có warnings:"
    cat lint.log
fi

# Kiểm tra file cấu hình quan trọng
echo "⚙️  Kiểm tra cấu hình..."

if [ ! -f "next.config.ts" ]; then
    echo "❌ LỖI: Thiếu next.config.ts"
    exit 1
else
    echo "✅ next.config.ts tồn tại"
fi

if [ ! -f "tailwind.config.ts" ]; then
    echo "❌ LỖI: Thiếu tailwind.config.ts"
    exit 1
else
    echo "✅ tailwind.config.ts tồn tại"
fi

# Kiểm tra data directory
if [ ! -d "data" ]; then
    echo "⚠️  Thiếu thư mục data, đang tạo..."
    mkdir -p data
    echo '[]' > data/users.json
    echo '[]' > data/posts.json
    echo '[]' > data/comments.json
    echo '[]' > data/reactions.json
    echo "✅ Đã tạo data directory"
else
    echo "✅ Data directory tồn tại"
fi

# Kiểm tra uploads directory
if [ ! -d "public/uploads" ]; then
    echo "⚠️  Thiếu thư mục uploads, đang tạo..."
    mkdir -p public/uploads
    echo "✅ Đã tạo uploads directory"
else
    echo "✅ Uploads directory tồn tại"
fi

# Test chạy server (background)
echo "🚀 Kiểm tra server..."
npm run start:production &
SERVER_PID=$!

# Đợi server khởi động
sleep 10

# Kiểm tra server có chạy không
if curl -f -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ Server chạy thành công!"
    echo "✅ Health check OK"
else
    echo "❌ Server không thể khởi động hoặc health check thất bại"
fi

# Dừng server
kill $SERVER_PID 2>/dev/null

# Tóm tắt
echo ""
echo "📊 TÓM TẮT KIỂM TRA:"
echo "=================================="
echo "Build: $([ $BUILD_EXIT_CODE -eq 0 ] && echo '✅ Thành công' || echo '❌ Thất bại')"
echo "TypeScript: $([ $TYPE_EXIT_CODE -eq 0 ] && echo '✅ OK' || echo '⚠️ Có warnings')"
echo "ESLint: $([ $LINT_EXIT_CODE -eq 0 ] && echo '✅ OK' || echo '⚠️ Có warnings')"
echo ""

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo "🎉 Dự án sẵn sàng deploy!"
    echo "Chạy lệnh sau để deploy:"
    echo "  - Vercel: npx vercel --prod"
    echo "  - Docker: docker build -t blog-chef ."
    echo "  - Manual: npm run start:production"
else
    echo "❌ Vui lòng sửa các lỗi build trước khi deploy"
fi

# Clean up log files
rm -f build.log typecheck.log lint.log
