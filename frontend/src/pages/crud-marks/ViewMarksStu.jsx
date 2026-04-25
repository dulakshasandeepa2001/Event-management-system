import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUserGraduate, FaBook, FaClipboardCheck, FaPercent, FaCalendarAlt, FaUserEdit } from "react-icons/fa";
import API from "../../api";

const ViewMarksStu = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/marks/student/${id}`);
        setRecord(res.data.data);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load marks detail.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const progress = useMemo(() => {
    if (!record?.maxMarks) return 0;
    const value = (Number(record.marks) / Number(record.maxMarks)) * 100;
    return Math.max(0, Math.min(100, value));
  }, [record]);

  const formatDate = (value) => {
    if (!value) return "-";
    try {
      return new Date(value).toLocaleString();
    } catch {
      return "-";
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1419] p-6 md:p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold mb-2">Marks Detail</h1>
            <p className="text-gray-400">View your assessment result and performance breakdown.</p>
          </div>

          <button
            onClick={() => navigate("/student-dashboard/list-marks")}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-[#1a1f2e] px-5 py-3 font-semibold text-white transition hover:bg-[#22283a]"
          >
            <FaArrowLeft /> Back
          </button>
        </div>

        {loading && (
          <div className="rounded-2xl border border-gray-700 bg-[#1a1f2e] p-10 text-center text-gray-400">
            Loading marks detail...
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
            {error}
          </div>
        )}

        {record && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <div className="rounded-2xl border border-gray-700 bg-[#1a1f2e] p-6 shadow-xl">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-500/15 px-4 py-2 text-sm font-semibold text-blue-300">
                      <FaClipboardCheck /> Assessment Result
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                      {record.assessmentName}
                    </h2>
                    <p className="mt-1 text-gray-400">
                      {record.subjectName} • {record.subjectCode}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-700 bg-[#0f1419] px-5 py-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Your Score</p>
                    <p className="mt-2 text-3xl font-bold text-emerald-400">
                      {record.marks}
                    </p>
                    <p className="text-sm text-gray-400">out of {record.maxMarks}</p>
                  </div>
                </div>

                <div className="mb-5">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-gray-400">Performance</span>
                    <span className="font-semibold text-orange-300">{Number(progress).toFixed(2)}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-gray-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-[#0f1419] p-5 border border-gray-700">
                    <div className="mb-2 flex items-center gap-2 text-gray-400">
                      <FaBook className="text-blue-400" />
                      <span className="text-sm">Subject</span>
                    </div>
                    <p className="text-lg font-semibold text-white">{record.subjectName}</p>
                    <p className="text-sm text-gray-500">{record.subjectCode}</p>
                  </div>

                  <div className="rounded-2xl bg-[#0f1419] p-5 border border-gray-700">
                    <div className="mb-2 flex items-center gap-2 text-gray-400">
                      <FaPercent className="text-emerald-400" />
                      <span className="text-sm">Percentage</span>
                    </div>
                    <p className="text-lg font-semibold text-white">
                      {Number(progress).toFixed(2)}%
                    </p>
                    <p className="text-sm text-gray-500">Based on max marks</p>
                  </div>

                  <div className="rounded-2xl bg-[#0f1419] p-5 border border-gray-700">
                    <div className="mb-2 flex items-center gap-2 text-gray-400">
                      <FaCalendarAlt className="text-purple-400" />
                      <span className="text-sm">Semester</span>
                    </div>
                    <p className="text-lg font-semibold text-white">{record.semester || "-"}</p>
                    <p className="text-sm text-gray-500">Current assessment semester</p>
                  </div>

                  <div className="rounded-2xl bg-[#0f1419] p-5 border border-gray-700">
                    <div className="mb-2 flex items-center gap-2 text-gray-400">
                      <FaUserEdit className="text-orange-400" />
                      <span className="text-sm">Uploaded By</span>
                    </div>
                    <p className="text-lg font-semibold text-white">{record.uploadedByName || "-"}</p>
                    <p className="text-sm text-gray-500">Assessment created by batch rep</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-700 bg-[#1a1f2e] p-6 shadow-xl">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl bg-blue-500/15 p-3 text-blue-300">
                    <FaUserGraduate />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Student View</h3>
                    <p className="text-sm text-gray-400">Your personal result summary</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-3 rounded-xl bg-[#0f1419] px-4 py-3">
                    <span className="text-gray-400">Marks</span>
                    <span className="font-semibold text-white">{record.marks}</span>
                  </div>
                  <div className="flex justify-between gap-3 rounded-xl bg-[#0f1419] px-4 py-3">
                    <span className="text-gray-400">Maximum</span>
                    <span className="font-semibold text-white">{record.maxMarks}</span>
                  </div>
                  <div className="flex justify-between gap-3 rounded-xl bg-[#0f1419] px-4 py-3">
                    <span className="text-gray-400">Percentage</span>
                    <span className="font-semibold text-emerald-400">{Number(progress).toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-700 bg-[#1a1f2e] p-6 shadow-xl">
                <h3 className="mb-4 text-lg font-bold">Record Info</h3>

                <div className="space-y-3 text-sm">
                  <div className="rounded-xl bg-[#0f1419] px-4 py-3">
                    <p className="text-gray-500">Uploaded At</p>
                    <p className="mt-1 font-semibold text-white">{formatDate(record.createdAt)}</p>
                  </div>
                  <div className="rounded-xl bg-[#0f1419] px-4 py-3">
                    <p className="text-gray-500">Semester</p>
                    <p className="mt-1 font-semibold text-white">{record.semester || "-"}</p>
                  </div>
                  <div className="rounded-xl bg-[#0f1419] px-4 py-3">
                    <p className="text-gray-500">Assessment</p>
                    <p className="mt-1 font-semibold text-white">{record.assessmentName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewMarksStu;