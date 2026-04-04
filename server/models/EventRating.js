import mongoose from "mongoose";

const eventRatingSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

eventRatingSchema.index({ event: 1, user: 1 }, { unique: true });

const EventRating = mongoose.model("EventRating", eventRatingSchema);
export default EventRating;