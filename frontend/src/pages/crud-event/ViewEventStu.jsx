import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUser,
  FaUsers,
  FaTag,
  FaClock,
  FaInfoCircle,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
} from "react-icons/fa";
import { toast } from "react-toastify";
import API from "../../api";
import ConfirmModal from "../components/ConfirmModal";

const ViewEventStu = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [details, setDetails] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(0);
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false);
  const [showUnregisterModal, setShowUnregisterModal] = useState(false);
  const [unregisterReason, setUnregisterReason] = useState("");
  const [unregisterNote, setUnregisterNote] = useState("");

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  }, []);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/event/${id}/details`);
      setDetails(res.data || null);
      setCommentText(res.data?.myComment?.comment || "");
      setRating(res.data?.myRating || 0);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load event");
      navigate("/student-dashboard/list-event");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRegister = async () => {
    try {
      setSaving(true);
      await API.post(`/event/${id}/register`);
      toast.success("Registered for event");
      fetchEvent();
      setShowRegisterConfirm(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Register failed");
    } finally {
      setSaving(false);
    }
  };

  const handleUnregister = async () => {
    if (!unregisterReason) {
      return toast.error("Please select a reason");
    }

    try {
      setSaving(true);
      await API.post(`/event/${id}/unregister`, {
        reason: unregisterReason,
        note: unregisterNote,
      });
      toast.success("Unregistered from event");
      setShowUnregisterModal(false);
      setUnregisterReason("");
      setUnregisterNote("");
      fetchEvent();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Unregister failed");
    } finally {
      setSaving(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) {
      return toast.error("Comment is required");
    }

    try {
      setSaving(true);
      await API.post(`/event/${id}/comments`, { comment: commentText });
      toast.success("Comment saved");
      fetchEvent();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Comment save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();

    if (!rating || rating < 1 || rating > 5) {
      return toast.error("Select a rating from 1 to 5");
    }

    try {
      setSaving(true);
      await API.post(`/event/${id}/ratings`, { rating });
      toast.success("Rating saved");
      fetchEvent();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Rating save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1419] text-white flex items-center justify-center">
        <p className="text-gray-400">Loading event details...</p>
      </div>
    );
  }

  const event = details?.event;
  const isRegistered = details?.isRegistered;

  const averageRating = Number(details?.ratingSummary?.average || 0);
  const ratingCount =
    details?.ratingSummary?.count ||
    details?.ratingCount ||
    details?.ratingSummary?.total ||
    0;

  const fullStars = Math.floor(averageRating);
  const hasHalfStar = averageRating - fullStars >= 0.5;

  if (!event) {
    return (
      <div className="min-h-screen bg-[#0f1419] text-white flex items-center justify-center">
        <p className="text-gray-400">Event not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white p-6 md:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate("/student-dashboard/list-event")}
            className="text-gray-400 hover:text-white transition"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <h1 className="text-3xl md:text-4xl font-bold">Event Details</h1>
        </div>

        <div className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-gray-700 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 md:p-8 border-b border-gray-700">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      event.status === "Upcoming"
                        ? "bg-green-500/20 text-green-300"
                        : event.status === "Ongoing"
                        ? "bg-yellow-500/20 text-yellow-300"
                        : event.status === "Completed"
                        ? "bg-purple-500/20 text-purple-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {event.status}
                  </span>

                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300">
                    {event.category}
                  </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold mb-3">{event.title}</h2>
                <p className="text-gray-300 leading-relaxed max-w-3xl">{event.description}</p>
              </div>

              <div className="min-w-[260px] bg-[#0f1419] border border-gray-700 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Current Student</p>
                <p className="text-white font-semibold">{currentUser?.u_name || "—"}</p>

                <p className="text-xs text-gray-500 mt-3 mb-1">Batch</p>
                <p className="text-white font-semibold">
                  {currentUser?.u_batchCode || event.batch?.batchCode || "—"}
                </p>

                <p className="text-xs text-gray-500 mt-3 mb-1">Participation</p>
                <p className={`font-semibold ${isRegistered ? "text-green-400" : "text-orange-300"}`}>
                  {isRegistered ? "Registered" : "Not Registered"}
                </p>

                <div className="mt-4 flex gap-2">
                  {!isRegistered ? (
                    <button
                      onClick={() => setShowRegisterConfirm(true)}
                      disabled={saving}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition"
                    >
                      Register
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowUnregisterModal(true)}
                      disabled={saving}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition"
                    >
                      Unregister
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 md:p-8">
            <div className="bg-[#0f1419] border border-gray-700 rounded-xl p-5">
              <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                <FaInfoCircle className="text-blue-400" />
                Event Information
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <FaCalendarAlt className="text-blue-400 mt-1" />
                  <div>
                    <p className="text-gray-500">Date</p>
                    <p className="text-white font-medium">
                      {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FaClock className="text-blue-400 mt-1" />
                  <div>
                    <p className="text-gray-500">Time</p>
                    <p className="text-white font-medium">
                      {(event.startTime || "—") + (event.endTime ? ` to ${event.endTime}` : "")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-blue-400 mt-1" />
                  <div>
                    <p className="text-gray-500">Location</p>
                    <p className="text-white font-medium">
                      {event.location || "No location provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FaTag className="text-blue-400 mt-1" />
                  <div>
                    <p className="text-gray-500">Category</p>
                    <p className="text-white font-medium">{event.category}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FaUser className="text-blue-400 mt-1" />
                  <div>
                    <p className="text-gray-500">Created By</p>
                    <p className="text-white font-medium">
                      {event.createdBy?.u_name || "Batch Rep"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0f1419] border border-gray-700 rounded-xl p-5">
              <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                <FaUsers className="text-blue-400" />
                Visibility & Feedback
              </h3>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Batch</p>
                  <p className="text-white font-medium">
                    {event.batch?.intakeYear} {event.batch?.name} - {event.batch?.course}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 mb-1">Target Groups</p>
                  <p className="text-white font-medium">
                    {(event.targetGroups || []).length && !event.targetGroups.includes("All")
                      ? event.targetGroups.join(", ")
                      : "All students in this batch"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 mb-1">Comments</p>
                  <p className="text-white font-medium">{details?.commentCount || 0}</p>
                </div>

                <div>
                  <p className="text-gray-500 mb-2">Average Rating</p>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, index) => {
                        if (index < fullStars) {
                          return <FaStar key={index} className="text-yellow-400" />;
                        }

                        if (index === fullStars && hasHalfStar) {
                          return <FaStarHalfAlt key={index} className="text-yellow-400" />;
                        }

                        return <FaRegStar key={index} className="text-gray-600" />;
                      })}
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold">
                        {averageRating.toFixed(1)} out of 5
                      </p>
                      <span className="text-gray-500">({ratingCount} ratings)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-300 text-sm leading-relaxed">
                      Only registered students can add comments and ratings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 md:px-8 pb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0f1419] border border-gray-700 rounded-xl p-5">
              <h3 className="text-xl font-bold mb-4">Add / Update Comment</h3>

              {isRegistered ? (
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={5}
                    placeholder="Write your comment..."
                    className="w-full bg-[#1a1f2e] border border-gray-700 text-white px-4 py-3 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-5 py-3 rounded-lg transition"
                  >
                    Save Comment
                  </button>
                </form>
              ) : (
                <p className="text-gray-400">Register first to comment.</p>
              )}
            </div>

            <div className="bg-[#0f1419] border border-gray-700 rounded-xl p-5">
              <h3 className="text-xl font-bold mb-4">Add / Update Rating</h3>

              {isRegistered ? (
                <form onSubmit={handleRatingSubmit} className="space-y-4">
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full bg-[#1a1f2e] border border-gray-700 text-white px-4 py-3 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value={0}>Select rating</option>
                    <option value={1}>1 - Poor</option>
                    <option value={2}>2 - Fair</option>
                    <option value={3}>3 - Good</option>
                    <option value={4}>4 - Very Good</option>
                    <option value={5}>5 - Excellent</option>
                  </select>

                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-black font-semibold px-5 py-3 rounded-lg transition"
                  >
                    Save Rating
                  </button>
                </form>
              ) : (
                <p className="text-gray-400">Register first to rate.</p>
              )}
            </div>
          </div>

          <div className="px-6 md:px-8 pb-8">
            <h3 className="text-xl font-bold mb-4">Comments</h3>

            <div className="space-y-4">
              {(details?.comments || []).length === 0 ? (
                <div className="bg-[#0f1419] border border-gray-700 rounded-xl p-5">
                  <p className="text-gray-400">No comments yet.</p>
                </div>
              ) : (
                details.comments.map((item) => (
                  <div
                    key={item._id}
                    className="bg-[#0f1419] border border-gray-700 rounded-xl p-5"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <p className="text-white font-semibold">{item.user?.u_name || "Student"}</p>
                        <p className="text-xs text-gray-500">
                          {item.user?.u_course || ""} {item.user?.u_batchCode || ""}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
                      </p>
                    </div>
                    <p className="text-gray-300">{item.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="px-6 md:px-8 pb-8">
            <button
              onClick={() => navigate("/student-dashboard/list-event")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-lg transition"
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        show={showRegisterConfirm}
        message="Are you sure you want to register for this event?"
        onConfirm={handleRegister}
        onCancel={() => setShowRegisterConfirm(false)}
      />

      {showUnregisterModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-lg bg-[#1a1f2e] border border-gray-700 rounded-2xl p-6">
            <h3 className="text-2xl font-bold mb-4">Unregister from Event</h3>

            <p className="text-gray-400 text-sm mb-4">
              Please select a reason for unregistering.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Reason *
              </label>
              <select
                value={unregisterReason}
                onChange={(e) => setUnregisterReason(e.target.value)}
                className="w-full bg-[#0f1419] border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-red-500"
              >
                <option value="">Select reason</option>
                <option value="Schedule conflict">Schedule conflict</option>
                <option value="Not interested">Not interested</option>
                <option value="Personal reason">Personal reason</option>
                <option value="Health issue">Health issue</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Note (optional)
              </label>
              <textarea
                value={unregisterNote}
                onChange={(e) => setUnregisterNote(e.target.value)}
                rows={4}
                className="w-full bg-[#0f1419] border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-red-500"
                placeholder="Add more details..."
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowUnregisterModal(false);
                  setUnregisterReason("");
                  setUnregisterNote("");
                }}
                className="px-5 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleUnregister}
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold"
              >
                {saving ? "Unregistering..." : "Confirm Unregister"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewEventStu;