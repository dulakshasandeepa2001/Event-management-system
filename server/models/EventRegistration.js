import mongoose from "mongoose";

const eventRegistrationSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ["registered", "cancelled"],
      default: "registered",
    },
    reason: {
      type: String,
      enum: [
        "Schedule conflict",
        "Not interested",
        "Personal reason",
        "Health issue",
        "Other",
      ],
      default: null,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

eventRegistrationSchema.index({ event: 1, user: 1 }, { unique: true });

const EventRegistration = mongoose.model("EventRegistration", eventRegistrationSchema);
export default EventRegistration;