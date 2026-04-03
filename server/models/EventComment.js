import mongoose from "mongoose";

const eventCommentSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

eventCommentSchema.index({ event: 1, user: 1 }, { unique: true });

const EventComment = mongoose.model("EventComment", eventCommentSchema);
export default EventComment;