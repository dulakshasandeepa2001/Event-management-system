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
} from "react-icons/fa";
import { toast } from "react-toastify";
import API from "../../api";

const ViewEventStu = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);

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
      const res = await API.get(`/event/${id}`);
      setEvent(res.data.event || null);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1419] text-white flex items-center justify-center">
        <p className="text-gray-400">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#0f1419] text-white flex items-center justify-center">
        <p className="text-gray-400">Event not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white p-6 md:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate("/student-dashboard/list-event")}
            className="text-gray-400 hover:text-white transition"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <h1 className="text-3xl md:text-4xl font-bold">Event Details</h1>
        </div>

        {/* Main card */}
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

                <p className="text-gray-300 leading-relaxed max-w-3xl">
                  {event.description}
                </p>
              </div>

              <div className="min-w-[240px] bg-[#0f1419] border border-gray-700 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Current Student</p>
                <p className="text-white font-semibold">{currentUser?.u_name || "—"}</p>
                <p className="text-xs text-gray-500 mt-3 mb-1">Batch</p>
                <p className="text-white font-semibold">
                  {currentUser?.u_batchCode || event.batch?.batchCode || "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 md:p-8">
            {/* Event Info */}
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

            {/* Batch / Target Info */}
            <div className="bg-[#0f1419] border border-gray-700 rounded-xl p-5">
              <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                <FaUsers className="text-blue-400" />
                Visibility
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
                  <p className="text-gray-500 mb-1">Status</p>
                  <p className="text-white font-medium">{event.status}</p>
                </div>

                <div className="pt-3">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-300 text-sm leading-relaxed">
                      This event is shown only to students in the correct batch, and optionally
                      only to the selected groups.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
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
    </div>
  );
};

export default ViewEventStu;