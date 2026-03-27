import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaSearch, FaEye, FaEdit, FaTrash, FaChartBar, FaUsers, FaRegFileAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import API from "../../api";
import ConfirmModal from "../components/ConfirmModal";

const ListMarks = () => {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [targetRecord, setTargetRecord] = useState(null);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await API.get("/marks");
      setRecords(res.data.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load marks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const filteredRecords = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return records;

    return records.filter((item) => {
      const subjectName = (item.subjectName || "").toLowerCase();
      const subjectCode = (item.subjectCode || "").toLowerCase();
      const assessmentName = (item.assessmentName || "").toLowerCase();
      const uploadedByName = (item.uploadedByName || "").toLowerCase();

      return (
        subjectName.includes(q) ||
        subjectCode.includes(q) ||
        assessmentName.includes(q) ||
        uploadedByName.includes(q)
      );
    });
  }, [records, query]);

  const stats = useMemo(() => {
    const totalUploads = records.length;
    const totalStudents = records.reduce((sum, item) => sum + (item.studentCount || item.rows?.length || 0), 0);
    const totalMarks = records.reduce((sum, item) => sum + Number(item.totalEntered || 0), 0);
    const avgPerUpload = totalUploads ? (totalMarks / totalUploads).toFixed(2) : "0.00";

    return { totalUploads, totalStudents, totalMarks, avgPerUpload };
  }, [records]);

  const openDeleteConfirm = (record) => {
    setTargetRecord(record);
    setShowConfirm(true);
  };

  const closeModal = () => {
    setTargetRecord(null);
    setShowConfirm(false);
  };

  const handleDelete = async () => {
    if (!targetRecord?._id) return;

    try {
      await API.delete(`/marks/${targetRecord._id}`);
      toast.success("Marks record deleted");
      closeModal();
      fetchRecords();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const handleView = async (id) => {
    try {
      if (openId === id) {
        setOpenId(null);
        setViewRecord(null);
        return;
      }

      setLoading(true);
      const res = await API.get(`/marks/${id}`);
      setViewRecord(res.data.data);
      setOpenId(id);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load details.");
    } finally {
      setLoading(false);
    }
  };

  const badgeClass = (status) => {
    return "bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/20";
  };

  return (
    <div className="min-h-screen bg-[#0f1419] p-6 md:p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold mb-2">Assessment Marks</h1>
            <p className="text-gray-400">Upload, review, edit, and manage marks by subject and assessment.</p>
          </div>

          <button
            onClick={() => navigate("/batchrep-dashboard/add-marks")}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:from-blue-700 hover:to-blue-800"
          >
            <FaPlus /> Add Marks
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-8">
          <div className="rounded-2xl border border-gray-700 bg-[#1a1f2e] p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Total Uploads</p>
              <FaRegFileAlt className="text-blue-400" />
            </div>
            <p className="mt-3 text-3xl font-bold text-blue-400">{stats.totalUploads}</p>
          </div>

          <div className="rounded-2xl border border-gray-700 bg-[#1a1f2e] p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Students Covered</p>
              <FaUsers className="text-emerald-400" />
            </div>
            <p className="mt-3 text-3xl font-bold text-emerald-400">{stats.totalStudents}</p>
          </div>

          <div className="rounded-2xl border border-gray-700 bg-[#1a1f2e] p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Total Entered</p>
              <FaChartBar className="text-purple-400" />
            </div>
            <p className="mt-3 text-3xl font-bold text-purple-400">{stats.totalMarks}</p>
          </div>

          <div className="rounded-2xl border border-gray-700 bg-[#1a1f2e] p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Avg / Upload</p>
              <FaRegFileAlt className="text-orange-400" />
            </div>
            <p className="mt-3 text-3xl font-bold text-orange-400">{stats.avgPerUpload}</p>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-700 bg-[#1a1f2e] p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-lg">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by subject, code, assessment, uploaded by..."
              className="w-full rounded-xl border border-gray-700 bg-[#0f1419] py-3 pl-11 pr-4 text-white placeholder-gray-500 outline-none transition focus:border-blue-500"
            />
          </div>

          <button
            onClick={fetchRecords}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-700 bg-[#0f1419] px-4 py-3 text-sm font-semibold text-gray-200 transition hover:bg-[#111827]"
          >
            Refresh
          </button>
        </div>

        {loading && (
          <div className="rounded-2xl border border-gray-700 bg-[#1a1f2e] p-10 text-center text-gray-400">
            Loading marks...
          </div>
        )}

        {message && (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-300">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
            {error}
          </div>
        )}

        {!loading && filteredRecords.length === 0 ? (
          <div className="rounded-2xl border border-gray-700 bg-[#1a1f2e] p-12 text-center">
            <FaRegFileAlt className="mx-auto text-5xl text-gray-500" />
            <p className="mt-4 text-lg text-gray-300">No marks records found</p>
            <p className="mt-1 text-sm text-gray-500">Create a new assessment upload to start.</p>
            <button
              onClick={() => navigate("/batchrep-dashboard/add-marks")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              <FaPlus /> Create First Upload
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border border-gray-700 bg-[#1a1f2e] shadow-xl">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-700 bg-[#111827]">
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Subject</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Assessment</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Max</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Students</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Uploaded By</th>
                    <th className="px-4 py-4 text-center text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.map((item, index) => (
                    <tr
                      key={item._id}
                      className={`border-b border-gray-700/60 transition hover:bg-white/5 ${
                        index % 2 === 0 ? "bg-[#0f1419]/30" : "bg-transparent"
                      }`}
                    >
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">{item.subjectName}</span>
                          <span className="text-xs text-gray-500">{item.subjectCode}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-sm ${badgeClass(item.status)}`}>
                          {item.assessmentName}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-gray-300">{item.maxMarks}</td>
                      <td className="px-4 py-4 text-gray-300">{item.studentCount || item.rows?.length || 0}</td>
                      <td className="px-4 py-4 text-gray-300">{item.uploadedByName || "-"}</td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleView(item._id)}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600/15 px-3 py-2 text-sm font-semibold text-blue-300 transition hover:bg-blue-600/25"
                          >
                            <FaEye /> {openId === item._id ? "Hide" : "View"}
                          </button>

                          <button
                            onClick={() => navigate(`/batchrep-dashboard/edit-marks/${item._id}`)}
                            className="inline-flex items-center gap-2 rounded-lg bg-amber-500/15 px-3 py-2 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/25"
                          >
                            <FaEdit /> Edit
                          </button>

                          <button
                            onClick={() => openDeleteConfirm(item)}
                            className="inline-flex items-center gap-2 rounded-lg bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/25"
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {viewRecord && (
              <div className="mt-8 rounded-2xl border border-gray-700 bg-[#1a1f2e] p-6 shadow-xl">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Assessment Details</h2>
                    <p className="mt-1 text-sm text-gray-400">
                      Subject-wise student marks for the selected assessment
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-700 bg-[#0f1419] px-4 py-3 text-right">
                    <p className="text-xs text-gray-500">Max Marks</p>
                    <p className="text-xl font-bold text-blue-400">{viewRecord.maxMarks}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
                  <div className="rounded-xl border border-gray-700 bg-[#0f1419] p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Subject</p>
                    <p className="mt-2 text-lg font-semibold text-white">{viewRecord.subjectName}</p>
                    <p className="text-sm text-gray-400">{viewRecord.subjectCode}</p>
                  </div>

                  <div className="rounded-xl border border-gray-700 bg-[#0f1419] p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Assessment</p>
                    <p className="mt-2 text-lg font-semibold text-white">{viewRecord.assessmentName}</p>
                  </div>

                  <div className="rounded-xl border border-gray-700 bg-[#0f1419] p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Uploaded By</p>
                    <p className="mt-2 text-lg font-semibold text-white">{viewRecord.uploadedByName || "-"}</p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-gray-700">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[#111827]">
                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Student ID</th>
                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Student Name</th>
                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Marks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewRecord.rows?.map((row, index) => (
                        <tr
                          key={index}
                          className={`border-t border-gray-700/60 ${
                            index % 2 === 0 ? "bg-[#0f1419]/40" : "bg-[#111827]/20"
                          }`}
                        >
                          <td className="px-4 py-4 text-gray-300">{row.studentId}</td>
                          <td className="px-4 py-4 text-white">{row.studentName}</td>
                          <td className="px-4 py-4">
                            <span className="inline-flex rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-300">
                              {row.marks}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        <ConfirmModal
          show={showConfirm}
          message={`Are you sure you want to delete "${targetRecord?.subjectName || "this marks record"}" ?`}
          onConfirm={handleDelete}
          onCancel={closeModal}
        />
      </div>
    </div>
  );
};

export default ListMarks;