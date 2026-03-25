import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaEye, FaEdit, FaSync, FaBan, FaTrash, FaPlus, FaDownload } from "react-icons/fa";
import API from "../../api";
import { toast } from "react-toastify";
import ConfirmModal from "../components/ConfirmModal";

const ListBatch = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  
  // Confirm modal
  const [showConfirm, setShowConfirm] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [targetBatch, setTargetBatch] = useState(null);

  // Edit state
  const [editingBatch, setEditingBatch] = useState(null);
  const [b_name, setB_name] = useState("");
  const [b_course, setB_course] = useState("");

  const loadBatches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/batch");
      const raw = res.data.batches || [];

      const data = raw.map((b) => ({
        id: b._id || b.id,
        name: b.name || "—",
        intakeYear: b.intakeYear,
        course: b.course || "N/A",
        studentCount: typeof b.studentCount === "number" ? b.studentCount : 0,
        activeCount: typeof b.activeCount === "number" ? b.activeCount : 0,
        groupsCount: Array.isArray(b.groups) ? b.groups.length : b.groupsCount || 0,
        createdAt: b.createdAt,
        raw: b,
        isActive: typeof b.isActive === "boolean" ? b.isActive : true,
      }));

      setBatches(data);
      setFiltered(data);
    } catch (err) {
      console.error("Failed to load batches", err);
      toast.error("Failed to load batches");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  // Search and filter
  useEffect(() => {
    const t = setTimeout(() => {
      const q = (query || "").trim().toLowerCase();
      let out = batches.slice();
      
      if (q) {
        out = out.filter(
          (b) => (b.name || "").toLowerCase().includes(q) || 
                 (b.course || "").toLowerCase().includes(q)
        );
      }
      
      if (filterCourse) {
        out = out.filter((b) => (b.course || "").toLowerCase() === filterCourse.toLowerCase());
      }
      
      setFiltered(out);
    }, 150);
    return () => clearTimeout(t);
  }, [query, filterCourse, batches]);

  // Get unique courses for filter
  const uniqueCourses = [...new Set(batches.map(b => b.course).filter(c => c !== "N/A"))];

  const handleExportCodes = async (id, name, studentCount) => {
    if (!id) return;
    if (!studentCount || studentCount === 0) {
      return toast.info("No students in this batch to export.");
    }
    try {
      const res = await API.get(`/batch/${id}/activation-codes`, { responseType: "blob" });
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `activation_codes_${(name || id).replace(/\s+/g, "_")}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("✅ Activation codes exported");
    } catch (err) {
      console.error("Export failed", err);
      toast.error(err.response?.data?.message || "Export failed");
    }
  };

  const confirmAction = (action, row) => {
    if (!row) return;
    setModalAction(action);
    setTargetBatch(row);
    setShowConfirm(true);
  };

  const doDeactivate = async () => {
    if (!targetBatch) return;
    try {
      await API.patch(`/batch/${targetBatch.id}/deactivate`);
      toast.success(`✅ Batch deactivated`);
      closeModal();
      loadBatches();
    } catch (err) {
      console.error("Deactivate failed", err);
      toast.error(err.response?.data?.message || "Deactivate failed");
    }
  };

  const doActivate = async () => {
    if (!targetBatch) return;
    try {
      await API.patch(`/batch/${targetBatch.id}/activate`);
      toast.success(`✅ Batch activated`);
      closeModal();
      loadBatches();
    } catch (err) {
      console.error("Activate failed", err);
      toast.error(err.response?.data?.message || "Activate failed");
    }
  };

  const doDelete = async () => {
    if (!targetBatch) return;
    try {
      await API.delete(`/batch/${targetBatch.id}`);
      toast.success(`✅ Batch deleted`);
      closeModal();
      loadBatches();
    } catch (err) {
      console.error("Delete failed", err);
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const handleConfirm = () => {
    if (modalAction === "deactivate") doDeactivate();
    else if (modalAction === "activate") doActivate();
    else if (modalAction === "delete") doDelete();
  };

  const closeModal = () => {
    setShowConfirm(false);
    setModalAction(null);
    setTargetBatch(null);
  };

  return (
    <div className="min-h-screen bg-[#0f1419] p-8 text-white overflow-y-auto">
      
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold mb-2">Manage Batches</h1>
          <p className="text-gray-400">Create, edit, export and manage all batches</p>
        </div>
        <button 
          onClick={() => navigate('/admin-dashboard/add-batch')}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center gap-2"
        >
          <FaPlus /> Create Batch
        </button>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Search */}
        <div className="md:col-span-2">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text"
              placeholder="Search by batch name or course..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#1a1f2e] border border-gray-700 text-white pl-12 pr-4 py-3 rounded-lg focus:border-blue-500 focus:outline-none transition placeholder-gray-600"
            />
          </div>
        </div>

        {/* Course Filter */}
        <div>
          <select 
            value={filterCourse} 
            onChange={(e) => setFilterCourse(e.target.value)}
            className="w-full bg-[#1a1f2e] border border-gray-700 text-white px-4 py-3 rounded-lg focus:border-blue-500 focus:outline-none transition"
          >
            <option value="">All Courses</option>
            {uniqueCourses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Total Batches</p>
          <p className="text-3xl font-bold text-blue-400 mt-1">{batches.length}</p>
        </div>
        <div className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Active Batches</p>
          <p className="text-3xl font-bold text-green-400 mt-1">{batches.filter(b => b.isActive).length}</p>
        </div>
        <div className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Total Students</p>
          <p className="text-3xl font-bold text-purple-400 mt-1">{batches.reduce((sum, b) => sum + b.studentCount, 0)}</p>
        </div>
        <div className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Filtered Results</p>
          <p className="text-3xl font-bold text-orange-400 mt-1">{filtered.length}</p>
        </div>
      </div>

      {/* Batches Table */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">Loading batches...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-gray-700 rounded-xl p-12 text-center">
          <p className="text-gray-400 text-lg mb-4">No batches found</p>
          <button 
            onClick={() => navigate('/admin-dashboard/add-batch')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition inline-flex items-center gap-2"
          >
            <FaPlus /> Create First Batch
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">Batch Name</th>
                <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">Course</th>
                <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">Intake Year</th>
                <th className="text-center py-4 px-4 text-gray-300 font-semibold text-sm">Students</th>
                <th className="text-center py-4 px-4 text-gray-300 font-semibold text-sm">Groups</th>
                <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">Created</th>
                <th className="text-center py-4 px-4 text-gray-300 font-semibold text-sm">Status</th>
                <th className="text-center py-4 px-4 text-gray-300 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((batch, i) => (
                <tr 
                  key={batch.id} 
                  className={`border-b border-gray-700/50 hover:bg-[#1a1f2e]/50 transition ${i % 2 === 0 ? 'bg-[#0f1419]/50' : ''}`}
                >
                  <td className="py-4 px-4">
                    <p className="font-semibold text-white">{batch.intakeYear} {batch.name}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                      {batch.course}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-white">{batch.intakeYear}</td>
                  <td className="py-4 px-4 text-center">
                    <div className="text-white font-semibold">{batch.studentCount}</div>
                    <div className="text-xs text-gray-500">{batch.activeCount} active</div>
                  </td>
                  <td className="py-4 px-4 text-center text-white font-semibold">{batch.groupsCount}</td>
                  <td className="py-4 px-4 text-gray-400 text-sm">
                    {batch.createdAt ? new Date(batch.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      batch.isActive 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {batch.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => navigate(`/admin-dashboard/view-batch/${batch.id}`)}
                        className="p-2 hover:bg-blue-500/20 rounded-lg transition text-blue-400"
                        title="View"
                      >
                        <FaEye />
                      </button>
                      <button 
                        onClick={() => handleExportCodes(batch.id, batch.name, batch.studentCount)}
                        className="p-2 hover:bg-green-500/20 rounded-lg transition text-green-400"
                        title="Export codes"
                      >
                        <FaDownload />
                      </button>
                      <button 
                        onClick={() => setEditingBatch(batch)}
                        className="p-2 hover:bg-purple-500/20 rounded-lg transition text-purple-400"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      {batch.isActive ? (
                        <button 
                          onClick={() => confirmAction("deactivate", batch)}
                          className="p-2 hover:bg-orange-500/20 rounded-lg transition text-orange-400"
                          title="Deactivate"
                        >
                          <FaBan />
                        </button>
                      ) : (
                        <>
                          <button 
                            onClick={() => confirmAction("activate", batch)}
                            className="p-2 hover:bg-green-500/20 rounded-lg transition text-green-400"
                            title="Activate"
                          >
                            <FaSync />
                          </button>
                          <button 
                            onClick={() => confirmAction("delete", batch)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-400"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal 
        show={showConfirm} 
        message={`Are you sure you want to ${modalAction} this batch?`}
        onConfirm={handleConfirm} 
        onCancel={closeModal}
      />
    </div>
  );
};

export default ListBatch;
