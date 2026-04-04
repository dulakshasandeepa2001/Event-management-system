import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaEye, FaCalendarAlt, FaMapMarkerAlt, FaUsers } from "react-icons/fa";
import { toast } from "react-toastify";
import API from "../../api";

const ListEventStu = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  }, []);

  const myBatchId =
    currentUser?.u_batchId ||
    currentUser?.batchId ||
    currentUser?.u_batch ||
    currentUser?.batch ||
    "";

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const res = await API.get("/event");
      const list = res.data.events || [];

      // Safety filter in frontend too
      const batchFiltered = myBatchId
        ? list.filter((event) => {
            const eventBatchId = event.batch?._id || event.batch?.id || event.batch;
            return String(eventBatchId) === String(myBatchId);
          })
        : [];

      setEvents(batchFiltered);
      setFiltered(batchFiltered);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myBatchId]);

  useEffect(() => {
    const t = setTimeout(() => {
      const q = query.trim().toLowerCase();
      let out = [...events];

      if (q) {
        out = out.filter((e) => {
          const batchName = `${e.batch?.intakeYear || ""} ${e.batch?.name || ""} ${e.batch?.course || ""}`;
          const groups = Array.isArray(e.targetGroups) ? e.targetGroups.join(", ") : "";
          return (
            (e.title || "").toLowerCase().includes(q) ||
            (e.description || "").toLowerCase().includes(q) ||
            (e.category || "").toLowerCase().includes(q) ||
            batchName.toLowerCase().includes(q) ||
            groups.toLowerCase().includes(q)
          );
        });
      }

      if (filterCategory) {
        out = out.filter((e) => e.category === filterCategory);
      }

      if (filterStatus) {
        out = out.filter((e) => e.status === filterStatus);
      }

      setFiltered(out);
    }, 150);

    return () => clearTimeout(t);
  }, [query, filterCategory, filterStatus, events]);

  const uniqueCategories = useMemo(() => {
    return [...new Set(events.map((e) => e.category).filter(Boolean))];
  }, [events]);

  return (
    <div className="min-h-screen bg-[#0f1419] text-white p-6 md:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">My Batch Events</h1>
          <p className="text-gray-400">
            Events created for your batch and related student group
          </p>
        </div>

        {/* Info card */}
        <div className="mb-8 bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-gray-700 rounded-xl p-5 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Student</p>
              <p className="text-white font-semibold">{currentUser?.u_name || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500">Batch</p>
              <p className="text-white font-semibold">
                {currentUser?.u_batchCode || currentUser?.u_batchId || "—"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Course</p>
              <p className="text-white font-semibold">{currentUser?.u_course || "—"}</p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-2 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search events..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#1a1f2e] border border-gray-700 text-white pl-12 pr-4 py-3 rounded-lg focus:border-blue-500 focus:outline-none transition placeholder-gray-600"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full bg-[#1a1f2e] border border-gray-700 text-white px-4 py-3 rounded-lg focus:border-blue-500 focus:outline-none transition"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-[#1a1f2e] border border-gray-700 text-white px-4 py-3 rounded-lg focus:border-blue-500 focus:outline-none transition"
          >
            <option value="">All Status</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Total Events</p>
            <p className="text-3xl font-bold text-blue-400 mt-1">{events.length}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Upcoming</p>
            <p className="text-3xl font-bold text-green-400 mt-1">
              {events.filter((e) => e.status === "Upcoming").length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Completed</p>
            <p className="text-3xl font-bold text-purple-400 mt-1">
              {events.filter((e) => e.status === "Completed").length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Filtered</p>
            <p className="text-3xl font-bold text-orange-400 mt-1">{filtered.length}</p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-16 text-center">
            <p className="text-gray-400">Loading events...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-gray-700 rounded-xl p-10 text-center">
            <p className="text-lg text-gray-400 mb-2">No events found for your batch</p>
            <p className="text-sm text-gray-500">
              Try another filter or wait for your batch rep to add events.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((event) => (
              <div
                key={event._id}
                className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-gray-700 rounded-xl p-6 hover:border-blue-500 transition shadow-lg"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {event.batch?.intakeYear} {event.batch?.name} - {event.batch?.course}
                    </p>
                  </div>

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
                </div>

                <p className="text-sm text-gray-300 line-clamp-3 mb-5">
                  {event.description}
                </p>

                <div className="space-y-3 text-sm text-gray-300 mb-6">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-blue-400" />
                    <span>
                      {event.eventDate
                        ? new Date(event.eventDate).toLocaleDateString()
                        : "—"}
                      {event.startTime ? ` • ${event.startTime}` : ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-blue-400" />
                    <span>{event.location || "No location given"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <FaUsers className="text-blue-400" />
                    <span>
                      {(event.targetGroups || []).length && !event.targetGroups.includes("All")
                        ? event.targetGroups.join(", ")
                        : "All students in batch"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/student-dashboard/view-event/${event._id}`)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <FaEye /> View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListEventStu;