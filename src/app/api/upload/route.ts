import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    // Convert file to base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "blog-chef/uploads",
      resource_type: "image",
      transformation: [
        { width: 800, height: 800, crop: "limit" },
        { quality: "auto", format: "auto" }
      ]
    });

    return NextResponse.json({
      success: true,
      message: "Upload hình ảnh thành công",
      data: {
        filename: result.public_id,
        url: result.secure_url,
        size: file.size,
        type: file.type,
        cloudinary_id: result.public_id,
      },
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi khi upload hình ảnh: " + (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Xóa hình ảnh
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { cloudinary_id } = body;

    if (!cloudinary_id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID Cloudinary không được cung cấp",
        },
        { status: 400 }
      );
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(cloudinary_id);

    if (result.result !== 'ok') {
      return NextResponse.json(
        {
          success: false,
          message: "Không thể xóa hình ảnh từ Cloudinary",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Xóa hình ảnh thành công",
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi khi xóa hình ảnh: " + (error as Error).message,
      },
      { status: 500 }
    );
  }
}
