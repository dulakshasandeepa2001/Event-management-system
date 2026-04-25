import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaPlus, FaArrowLeft, FaSave } from "react-icons/fa";
import API from "../../api";

const AddEvent = () => {
  const navigate = useNavigate();

  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Academic");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [batchId, setBatchId] = useState("");
  const [targetGroups, setTargetGroups] = useState(["All"]);
  const [status, setStatus] = useState("Upcoming");
  const [saving, setSaving] = useState(false);

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

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
    currentUser?.assignedBatch ||
    "";

  const groupOptions = ["All", "Group 1", "Group 2", "Group 3", "Group 4", "Group 5"];

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoadingBatches(true);
        const res = await API.get("/batch");
        let list = res.data.batches || [];

        // Batch rep should only see their own batch if the relation exists
        if (currentUser?.u_role === "batchrep" && myBatchId) {
          list = list.filter((b) => String(b._id || b.id) === String(myBatchId));
        }

        setBatches(list);

        if (list.length === 1) {
          setBatchId(String(list[0]._id || list[0].id));
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load batches");
      } finally {
        setLoadingBatches(false);
      }
    };

    fetchBatches();
  }, [currentUser?.u_role, myBatchId]);

  const toggleGroup = (group) => {
    if (group === "All") {
      setTargetGroups(["All"]);
      return;
    }

    setTargetGroups((prev) => {
      const withoutAll = prev.filter((g) => g !== "All");
      if (withoutAll.includes(group)) {
        const next = withoutAll.filter((g) => g !== group);
        return next.length ? next : ["All"];
      }
      return [...withoutAll, group];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !eventDate || !batchId) {
      return toast.error("Please fill all required fields");
    }

    try {
      setSaving(true);

      const payload = {
        title,
        description,
        category,
        eventDate,
        startTime,
        endTime,
        location,
        batchId,
        targetGroups,
        status,
      };

      await API.post("/event", payload);

      toast.success("✅ Event created successfully");
      navigate("/batchrep-dashboard/list-event");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create event");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1419] p-8 text-white overflow-y-auto">
      <div className="mb-8 flex items-center gap-3">
        <button
          onClick={() => navigate("/batchrep-dashboard")}
          className="text-gray-400 hover:text-white transition"
        >
          <FaArrowLeft className="text-xl" />
        </button>
        <h1 className="text-4xl font-bold">Create Event</h1>
      </div>

      <div className="max-w-4xl bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-gray-700 rounded-xl p-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Event Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0f1419] border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter event title"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#0f1419] border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="Academic">Academic</option>
              <option value="Sports">Sports</option>
              <option value="Workshop">Workshop</option>
              <option value="Social">Social</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-300 mb-2">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full bg-[#0f1419] border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Write event details..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Event Date *</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              min={getTodayDate()}
              className="w-full bg-[#0f1419] border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Batch *</label>
            <select
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="w-full bg-[#0f1419] border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-green-500"
              disabled={loadingBatches || (currentUser?.u_role === "batchrep" && !!myBatchId)}
            >
              <option value="">{loadingBatches ? "Loading batches..." : "Select batch"}</option>
              {batches.map((b) => (
                <option key={b._id || b.id} value={b._id || b.id}>
                  {b.intakeYear} {b.name} - {b.course}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => {
                const time = e.target.value;
                if (time && (time < "08:00" || time > "20:00")) {
                  toast.error("Start time must be between 8:00 AM and 8:00 PM");
                  return;
                }
                setStartTime(time);
              }}
              min="08:00"
              max="20:00"
              className="w-full bg-[#0f1419] border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => {
                const time = e.target.value;
                if (time && time > "20:00") {
                  toast.error("End time cannot be after 8:00 PM");
                  return;
                }
                setEndTime(time);
              }}
              min="08:00"
              max="20:00"
              className="w-full bg-[#0f1419] border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-300 mb-2">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-[#0f1419] border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Event location"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-300 mb-3">Target Groups</label>
            <div className="flex flex-wrap gap-3">
              {groupOptions.map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => toggleGroup(group)}
                  className={`px-4 py-2 rounded-lg border transition ${
                    targetGroups.includes(group)
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-[#0f1419] border-gray-700 text-gray-300"
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[#0f1419] border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="Upcoming">Upcoming</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="md:col-span-2 flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FaSave /> {saving ? "Saving..." : "Create Event"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/batchrep-dashboard/list-event")}
              className="px-6 bg-[#1a1f2e] border border-gray-700 text-white font-semibold py-3 rounded-lg hover:border-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEvent;