import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaChartBar, FaFileAlt, FaSearch, FaEye, FaListAlt } from "react-icons/fa";
import API from "../../api";

const ListMarksStu = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await API.get("/marks/student");
      setRecords(res.data.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load your marks.");
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
      return (
        subjectName.includes(q) ||
        subjectCode.includes(q) ||
        assessmentName.includes(q)
      );
    });
  }, [records, query]);

  const summary = useMemo(() => {
    const grouped = new Map();

    filteredRecords.forEach((item) => {
      const key = `${item.subjectCode}-${item.subjectName}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          subjectName: item.subjectName,
          subjectCode: item.subjectCode,
          totalMarks: 0,
          totalMax: 0,
          count: 0,
        });
      }

      const current = grouped.get(key);
      current.totalMarks += Number(item.marks || 0);
      current.totalMax += Number(item.maxMarks || 0);
      current.count += 1;
    });

    return [...grouped.values()].map((item) => ({
      ...item,
      percentage: item.totalMax ? ((item.totalMarks / item.totalMax) * 100).toFixed(2) : "0.00",
    }));
  }, [filteredRecords]);

  const overall = useMemo(() => {
    const totalMarks = filteredRecords.reduce((sum, item) => sum + Number(item.marks || 0), 0);
    const totalMax = filteredRecords.reduce((sum, item) => sum + Number(item.maxMarks || 0), 0);
    const percentage = totalMax ? ((totalMarks / totalMax) * 100).toFixed(2) : "0.00";
    return { totalMarks, totalMax, percentage };
  }, [filteredRecords]);

  return (
    <div className="min-h-screen bg-[#0f1419] p-6 md:p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold mb-2">My Marks</h1>
            <p className="text-gray-400">View your assessments, totals, and subject performance in one place.</p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-[#1a1f2e] px-4 py-3 text-sm text-gray-300">
            <FaFileAlt className="text-blue-400" />
            {filteredRecords.length} records
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-8">
          <div className="rounded-2xl border border-gray-700 bg-[#1a1f2e] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Assessments</p>
              <FaListAlt className="text-blue-400" />
            </div>
            <p className="mt-3 text-3xl font-bold text-blue-400">{filteredRecords.length}</p>
          </div>

          <div className="rounded-2xl border border-gray-700 bg-[#1a1f2e] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Subjects</p>
              <FaChartBar className="text-emerald-400" />
            </div>
            <p className="mt-3 text-3xl font-bold text-emerald-400">{summary.length}</p>
          </div>

          <div className="rounded-2xl border border-gray-700 bg-[#1a1f2e] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Total Marks</p>
              <FaFileAlt className="text-purple-400" />
            </div>
            <p className="mt-3 text-3xl font-bold text-purple-400">{overall.totalMarks}</p>
          </div>

          <div className="rounded-2xl border border-gray-700 bg-[#1a1f2e] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Overall %</p>
              <FaChartBar className="text-orange-400" />
            </div>
            <p className="mt-3 text-3xl font-bold text-orange-400">{overall.percentage}%</p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-gray-700 bg-[#1a1f2e] p-4">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by subject, code, or assessment..."
              className="w-full rounded-xl border border-gray-700 bg-[#0f1419] py-3 pl-11 pr-4 text-white placeholder-gray-500 outline-none transition focus:border-blue-500"
            />
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-gray-700 bg-[#1a1f2e] p-10 text-center text-gray-400">
            Loading your marks...
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
            {error}
          </div>
        )}

        {!loading && filteredRecords.length === 0 ? (
          <div className="rounded-2xl border border-gray-700 bg-[#1a1f2e] p-12 text-center">
            <FaFileAlt className="mx-auto text-5xl text-gray-500" />
            <p className="mt-4 text-lg text-gray-300">No marks found</p>
            <p className="mt-1 text-sm text-gray-500">Once lecturers upload assessments, your marks will appear here.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {summary.map((item) => (
                <div
                  key={`${item.subjectCode}-${item.subjectName}`}
                  className="rounded-2xl border border-gray-700 bg-[#1a1f2e] p-5 shadow-lg transition hover:-translate-y-1 hover:border-blue-500/30"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-white">{item.subjectName}</h3>
                      <p className="text-sm text-gray-400">{item.subjectCode}</p>
                    </div>
                    <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-300">
                      {item.count} items
                    </span>
                  </div>

                  <div className="mb-3 rounded-xl bg-[#0f1419] p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Score</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-400">
                      {item.totalMarks} <span className="text-gray-500">/ {item.totalMax}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Percentage</span>
                    <span className="font-semibold text-orange-300">{item.percentage}%</span>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400"
                      style={{ width: `${Math.min(Number(item.percentage), 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-700 bg-[#1a1f2e] shadow-xl">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-700 bg-[#111827]">
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Subject</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Assessment</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Marks</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Max</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">%</th>
                    <th className="px-4 py-4 text-center text-sm font-semibold text-gray-300">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.map((item, index) => (
                    <tr
                      key={item.id}
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

                      <td className="px-4 py-4 text-gray-300">{item.assessmentName}</td>

                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-300">
                          {item.marks}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-gray-300">{item.maxMarks}</td>

                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full bg-blue-500/15 px-3 py-1 text-sm font-semibold text-blue-300">
                          {item.percentage}%
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <button
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                          onClick={() => navigate(`/student-dashboard/view-marks/${item.id}`)}
                        >
                          <FaEye /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ListMarksStu;