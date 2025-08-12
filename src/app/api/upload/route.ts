import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// POST - Upload hình ảnh
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "Không có file được tải lên",
        },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Định dạng file không được hỗ trợ. Chỉ chấp nhận: JPG, PNG, GIF, WebP",
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: "File quá lớn. Kích thước tối đa là 5MB",
        },
        { status: 400 }
      );
    }

    // Create upload directory
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.name);
    const filename = `${timestamp}_${randomStr}${extension}`;
    const filepath = path.join(uploadDir, filename);

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filepath, buffer);

    // Return file URL
    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      message: "Upload hình ảnh thành công",
      data: {
        filename,
        url: fileUrl,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi khi upload hình ảnh",
      },
      { status: 500 }
    );
  }
}

// DELETE - Xóa hình ảnh
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename } = body;

    if (!filename) {
      return NextResponse.json(
        {
          success: false,
          message: "Tên file không được cung cấp",
        },
        { status: 400 }
      );
    }

    const filepath = path.join(process.cwd(), "public", "uploads", filename);

    // Check if file exists
    try {
      await fs.access(filepath);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "File không tồn tại",
        },
        { status: 404 }
      );
    }

    // Delete file
    await fs.unlink(filepath);

    return NextResponse.json({
      success: true,
      message: "Xóa hình ảnh thành công",
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi khi xóa hình ảnh",
      },
      { status: 500 }
    );
  }
}
