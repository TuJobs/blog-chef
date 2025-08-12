import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Tiêu đề không được để trống"],
      trim: true,
      maxlength: [200, "Tiêu đề không được vượt quá 200 ký tự"],
    },
    content: {
      type: String,
      required: [true, "Nội dung không được để trống"],
    },
    excerpt: {
      type: String,
      maxlength: [300, "Tóm tắt không được vượt quá 300 ký tự"],
    },
    images: [
      {
        url: String,
        alt: String,
        caption: String,
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    anonymousAuthor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AnonymousUser",
    },
    authorType: {
      type: String,
      enum: ["user", "anonymous"],
      required: true,
    },
    category: {
      type: String,
      enum: [
        "cooking", // Nấu ăn
        "home", // Chăm sóc nhà cửa
        "baby", // Chăm sóc con cái
        "beauty", // Làm đẹp
        "health", // Sức khỏe
        "family", // Gia đình
        "budget", // Quản lý tài chính
        "diy", // Tự làm
        "lifestyle", // Lối sống
        "tips", // Mẹo hay
        "other", // Khác
      ],
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    reactions: {
      likes: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      hearts: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
    },
    views: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes để tối ưu truy vấn
PostSchema.index({ author: 1 });
PostSchema.index({ category: 1 });
PostSchema.index({ status: 1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ views: -1 });
PostSchema.index({ featured: -1 });
PostSchema.index({ tags: 1 });

// Virtual để đếm số lượng reactions
PostSchema.virtual("likesCount").get(function () {
  return this.reactions?.likes?.length || 0;
});

PostSchema.virtual("heartsCount").get(function () {
  return this.reactions?.hearts?.length || 0;
});

// Đảm bảo virtual fields được include khi convert sang JSON
PostSchema.set("toJSON", { virtuals: true });
PostSchema.set("toObject", { virtuals: true });

export default mongoose.models.Post || mongoose.model("Post", PostSchema);
