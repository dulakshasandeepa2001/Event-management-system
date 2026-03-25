import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, },
    description: { type: String, required: true, trim: true, },

    category: {
      type: String,
      enum: ["Academic", "Sports", "Workshop", "Social", "Other"],
      default: "Academic", },

    eventDate: { type: Date, required: true, },
    startTime: { type: String, default: "", },
    endTime: { type: String, default: "", },
    location: { type: String, default: "", trim: true, },

    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true, index: true, },
    targetGroups: [ { type: String, trim: true, },  ],

    status: {
      type: String,
      enum: ["Upcoming", "Ongoing", "Completed", "Cancelled"],
      default: "Upcoming",
      index: true,
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", },
  },
  { timestamps: true }
);

eventSchema.index({ batch: 1, status: 1, eventDate: 1 });

const Event = mongoose.model("Event", eventSchema);
export default Event;