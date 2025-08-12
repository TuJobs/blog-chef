import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Nội dung bình luận không được để trống"],
      trim: true,
      maxlength: [1000, "Bình luận không được vượt quá 1000 ký tự"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
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
    },
    status: {
      type: String,
      enum: ["active", "hidden", "deleted"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
CommentSchema.index({ post: 1 });
CommentSchema.index({ author: 1 });
CommentSchema.index({ parentComment: 1 });
CommentSchema.index({ createdAt: -1 });

// Virtual để đếm số lượng likes
CommentSchema.virtual("likesCount").get(function () {
  return this.reactions?.likes?.length || 0;
});

// Virtual để lấy replies (comments con)
CommentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentComment",
});

// Đảm bảo virtual fields được include khi convert sang JSON
CommentSchema.set("toJSON", { virtuals: true });
CommentSchema.set("toObject", { virtuals: true });

export default mongoose.models.Comment ||
  mongoose.model("Comment", CommentSchema);
