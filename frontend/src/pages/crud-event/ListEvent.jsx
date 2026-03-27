import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaSync } from "react-icons/fa";
import { toast } from "react-toastify";
import API from "../../api";
import ConfirmModal from "../components/ConfirmModal";

const ListEvent = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);
  const [targetEvent, setTargetEvent] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await API.get("/event");
      const list = res.data.events || [];
      setEvents(list);
      setFiltered(list);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      const q = query.trim().toLowerCase();
      let out = [...events];

      if (q) {
        out = out.filter((e) => {
          const batchName = e.batch?.name || "";
          return (
            (e.title || "").toLowerCase().includes(q) ||
            (e.description || "").toLowerCase().includes(q) ||
            (batchName || "").toLowerCase().includes(q)
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

  const openDeleteConfirm = (event) => {
    setTargetEvent(event);
    setShowConfirm(true);
  };

  const closeModal = () => {
    setTargetEvent(null);
    setShowConfirm(false);
  };

  const handleDelete = async () => {
    if (!targetEvent?._id) return;

    try {
      await API.delete(`/event/${targetEvent._id}`);
      toast.success("✅ Event deleted");
      closeModal();
      fetchEvents();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete event");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1419] p-8 text-white overflow-y-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold mb-2">Manage Events</h1>
          <p className="text-gray-400">Create, edit and manage batch events</p>
        </div>

        <button
          onClick={() => navigate("/batchrep-dashboard/add-event")}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center gap-2"
        >
          <FaPlus /> Create Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-2 relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by title, description, batch..."
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">Loading events...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-gray-700 rounded-xl p-12 text-center">
          <p className="text-gray-400 text-lg mb-4">No events found</p>
          <button
            onClick={() => navigate("/batchrep-dashboard/add-event")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition inline-flex items-center gap-2"
          >
            <FaPlus /> Create First Event
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#1a1f2e] border border-gray-700 rounded-xl">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">Title</th>
                <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">Batch</th>
                <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">Category</th>
                <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">Date</th>
                <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">Groups</th>
                <th className="text-center py-4 px-4 text-gray-300 font-semibold text-sm">Status</th>
                <th className="text-center py-4 px-4 text-gray-300 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((event, i) => (
                <tr
                  key={event._id}
                  className={`border-b border-gray-700/50 hover:bg-[#0f1419]/60 transition ${
                    i % 2 === 0 ? "bg-[#0f1419]/40" : ""
                  }`}
                >
                  <td className="py-4 px-4">
                    <p className="font-semibold text-white">{event.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{event.description}</p>
                  </td>

                  <td className="py-4 px-4 text-gray-300">
                    {event.batch?.intakeYear} {event.batch?.name} - {event.batch?.course}
                  </td>

                  <td className="py-4 px-4">
                    <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                      {event.category}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-gray-300">
                    {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : "—"}
                  </td>

                  <td className="py-4 px-4 text-gray-300">
                    {(event.targetGroups || []).length ? event.targetGroups.join(", ") : "All"}
                  </td>

                  <td className="py-4 px-4 text-center">
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
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/batchrep-dashboard/edit-event/${event._id}`)}
                        className="p-2 hover:bg-blue-500/20 rounded-lg transition text-blue-400"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>

                      <button
                        onClick={() => openDeleteConfirm(event)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-400"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        show={showConfirm}
        message={`Are you sure you want to delete "${targetEvent?.title || "this event"}"?`}
        onConfirm={handleDelete}
        onCancel={closeModal}
      />
    </div>
  );
};

export default ListEvent;