import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image to Cloudinary
export async function uploadImage(
  file: File | Buffer | string,
  folder = "blog_chef",
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  } = {}
): Promise<{
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}> {
  try {
    const result = await cloudinary.uploader.upload(file as string, {
      folder,
      resource_type: "image",
      transformation: [
        {
          width: options.width || 1200,
          height: options.height || 800,
          crop: options.crop || "limit",
          quality: options.quality || "auto",
          format: options.format || "webp",
        },
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Failed to upload image");
  }
}

// Delete image from Cloudinary
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw new Error("Failed to delete image");
  }
}

// Generate optimized image URL
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  } = {}
): string {
  return cloudinary.url(publicId, {
    transformation: [
      {
        width: options.width || 800,
        height: options.height || 600,
        crop: options.crop || "fill",
        quality: options.quality || "auto",
        format: options.format || "webp",
      },
    ],
  });
}

// Generate multiple image sizes for responsive images
export function generateResponsiveImages(publicId: string): {
  small: string;
  medium: string;
  large: string;
  original: string;
} {
  return {
    small: getOptimizedImageUrl(publicId, { width: 400, height: 300 }),
    medium: getOptimizedImageUrl(publicId, { width: 800, height: 600 }),
    large: getOptimizedImageUrl(publicId, { width: 1200, height: 900 }),
    original: cloudinary.url(publicId, { quality: "auto", format: "webp" }),
  };
}

export default cloudinary;
