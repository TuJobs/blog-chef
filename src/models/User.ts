import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên không được để trống"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email không được để trống"],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Mật khẩu không được để trống"],
      minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
    },
    avatar: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: "",
      maxlength: [500, "Bio không được vượt quá 500 ký tự"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index để tối ưu truy vấn và đảm bảo email unique
UserSchema.index({ email: 1 }, { unique: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
