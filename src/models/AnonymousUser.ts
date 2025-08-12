import mongoose from "mongoose";

const AnonymousUserSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    nickname: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index để tự động xóa user cũ sau 30 ngày không hoạt động
AnonymousUserSchema.index(
  { lastActive: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
);

export default mongoose.models.AnonymousUser ||
  mongoose.model("AnonymousUser", AnonymousUserSchema);
