import React, { useEffect, useState } from "react";
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

const ViewEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [tab, setTab] = useState("registered");

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/event/${id}/details`);
      setDetails(res.data || null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load event details");
      navigate("/batchrep-dashboard/list-event");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1419] text-white flex items-center justify-center">
        <p className="text-gray-400">Loading event details...</p>
      </div>
    );
  }

  const event = details?.event;

  if (!event) {
    return (
      <div className="min-h-screen bg-[#0f1419] text-white flex items-center justify-center">
        <p className="text-gray-400">Event not found</p>
      </div>
    );
  }

  const registeredStudents = details?.registeredStudents || [];
  const cancelledStudents = details?.cancelledStudents || [];
  const comments = details?.comments || [];

  const ratingSummary = details?.ratingSummary || { count: 0, average: 0 };
  const averageRating = Number(ratingSummary.average || 0);
  const ratingCount = Number(ratingSummary.count || 0);

  const fullStars = Math.floor(averageRating);
  const hasHalfStar = averageRating - fullStars >= 0.5;

  return (
    <div className="min-h-screen bg-[#0f1419] text-white p-6 md:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate("/batchrep-dashboard/list-event")}
            className="text-gray-400 hover:text-white transition"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <h1 className="text-3xl md:text-4xl font-bold">Event View</h1>
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
                <p className="text-xs text-gray-500 mb-1">Batch</p>
                <p className="text-white font-semibold">
                  {event.batch?.intakeYear} {event.batch?.name} - {event.batch?.course}
                </p>

                <p className="text-xs text-gray-500 mt-3 mb-1">Created By</p>
                <p className="text-white font-semibold">{event.createdBy?.u_name || "—"}</p>

                <p className="text-xs text-gray-500 mt-3 mb-1">Updated By</p>
                <p className="text-white font-semibold">{event.updatedBy?.u_name || "—"}</p>
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
                  <FaUsers className="text-blue-400 mt-1" />
                  <div>
                    <p className="text-gray-500">Target Groups</p>
                    <p className="text-white font-medium">
                      {(event.targetGroups || []).length && !event.targetGroups.includes("All")
                        ? event.targetGroups.join(", ")
                        : "All students in this batch"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0f1419] border border-gray-700 rounded-xl p-5">
              <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                <FaStar className="text-blue-400" />
                Feedback Summary
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="bg-[#1a1f2e] border border-gray-700 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Registered</p>
                  <p className="text-2xl font-bold text-green-400">{registeredStudents.length}</p>
                </div>
                <div className="bg-[#1a1f2e] border border-gray-700 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Cancelled</p>
                  <p className="text-2xl font-bold text-red-400">{cancelledStudents.length}</p>
                </div>
                <div className="bg-[#1a1f2e] border border-gray-700 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Comments</p>
                  <p className="text-2xl font-bold text-blue-400">{comments.length}</p>
                </div>
                <div className="bg-[#1a1f2e] border border-gray-700 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Avg Rating</p>

                  {ratingCount > 0 ? (
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
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

                      <p className="text-sm font-semibold text-yellow-400">
                        {averageRating.toFixed(1)} / 5
                      </p>

                      <span className="text-xs text-gray-500">
                        ({ratingCount} ratings)
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-gray-500 mt-2">
                      No ratings yet
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setTab("registered")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                      tab === "registered"
                        ? "bg-green-600 text-white"
                        : "bg-[#1a1f2e] text-gray-300"
                    }`}
                  >
                    Registered Students
                  </button>
                  <button
                    onClick={() => setTab("cancelled")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                      tab === "cancelled"
                        ? "bg-red-600 text-white"
                        : "bg-[#1a1f2e] text-gray-300"
                    }`}
                  >
                    Cancelled Students
                  </button>
                  <button
                    onClick={() => setTab("comments")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                      tab === "comments"
                        ? "bg-blue-600 text-white"
                        : "bg-[#1a1f2e] text-gray-300"
                    }`}
                  >
                    Comments
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 md:px-8 pb-8">
            {tab === "registered" && (
              <div className="bg-[#0f1419] border border-gray-700 rounded-xl p-5">
                <h3 className="text-xl font-bold mb-4">Registered Students</h3>
                {registeredStudents.length === 0 ? (
                  <p className="text-gray-400">No registered students yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-700 text-gray-400">
                          <th className="text-left py-3">Name</th>
                          <th className="text-left py-3">Reg No</th>
                          <th className="text-left py-3">Registered At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registeredStudents.map((item) => (
                          <tr key={item._id} className="border-b border-gray-800">
                            <td className="py-3">{item.user?.u_name || "—"}</td>
                            <td className="py-3">{item.user?.u_regno || "—"}</td>
                            <td className="py-3">
                              {item.registeredAt
                                ? new Date(item.registeredAt).toLocaleString()
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {tab === "cancelled" && (
              <div className="bg-[#0f1419] border border-gray-700 rounded-xl p-5">
                <h3 className="text-xl font-bold mb-4">Cancelled Students</h3>
                {cancelledStudents.length === 0 ? (
                  <p className="text-gray-400">No cancelled registrations.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-700 text-gray-400">
                          <th className="text-left py-3">Name</th>
                          <th className="text-left py-3">Reg No</th>
                          <th className="text-left py-3">Reason</th>
                          <th className="text-left py-3">Note</th>
                          <th className="text-left py-3">Cancelled At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cancelledStudents.map((item) => (
                          <tr key={item._id} className="border-b border-gray-800">
                            <td className="py-3">{item.user?.u_name || "—"}</td>
                            <td className="py-3">{item.user?.u_regno || "—"}</td>
                            <td className="py-3">{item.reason || "—"}</td>
                            <td className="py-3">{item.note || "—"}</td>
                            <td className="py-3">
                              {item.cancelledAt
                                ? new Date(item.cancelledAt).toLocaleString()
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {tab === "comments" && (
              <div className="space-y-4">
                <div className="bg-[#0f1419] border border-gray-700 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Comments</h3>

                    <button
                      onClick={() => navigate(`/batchrep-dashboard/event/${id}/comments`)}
                      className="text-sm bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
                    >
                      View All
                    </button>
                  </div>

                  {comments.length === 0 ? (
                    <p className="text-gray-400">No comments yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {comments.slice(0, 5).map((item) => (
                        <div
                          key={item._id}
                          className="bg-[#1a1f2e] border border-gray-700 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <p className="font-semibold">{item.user?.u_name || "Student"}</p>
                              <p className="text-xs text-gray-500">
                                {item.user?.u_course || ""} {item.user?.u_batchCode || ""}
                              </p>
                            </div>
                            <p className="text-xs text-gray-500">
                              {item.createdAt
                                ? new Date(item.createdAt).toLocaleString()
                                : ""}
                            </p>
                          </div>
                          <p className="text-gray-300">{item.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEvent;