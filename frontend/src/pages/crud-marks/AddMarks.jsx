import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaFileUpload, FaSave, FaChartBar, FaArrowLeft, FaEye, FaExclamationTriangle, FaCheckCircle, FaFileAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import API from "../../api";
import { useAuth } from "../../context/AuthContext";

const emptyForm = {
  subjectName: "",
  subjectCode: "",
  assessmentName: "",
  maxMarks: "",
  semester: "1",
  batchId: "",
};

const AddMarks = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [invalidRows, setInvalidRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [batches, setBatches] = useState([]);

  const isEdit = useMemo(() => Boolean(id), [id]);
  const isLecturer = user?.u_role === "lecturer";

  useEffect(() => {
    const loadExisting = async () => {
      if (!isEdit) return;

      try {
        setLoading(true);
        const res = await API.get(`/marks/${id}`);
        const data = res.data.data;

        setForm({
          subjectName: data.subjectName || "",
          subjectCode: data.subjectCode || "",
          assessmentName: data.assessmentName || "",
          maxMarks: data.maxMarks ?? "",
          semester: String(data.semester || "1"),
          batchId: data.batchId || data.batch?._id || "",
        });

        setPreviewRows(data.rows || []);
        setSummary({
          subjectName: data.subjectName,
          subjectCode: data.subjectCode,
          assessmentName: data.assessmentName,
          maxMarks: data.maxMarks,
          totalRows: data.rows?.length || 0,
          validRows: data.rows?.length || 0,
          invalidRows: 0,
        });
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load marks record.");
      } finally {
        setLoading(false);
      }
    };

    loadExisting();
  }, [id, isEdit]);

  useEffect(() => {
    const loadBatches = async () => {
      if (!isLecturer) return;

      try {
        const res = await API.get("/batches");
        setBatches(res.data?.batches || []);
      } catch (_err) {
        setBatches([]);
      }
    };

    loadBatches();
  }, [isLecturer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("subjectName", form.subjectName);
    fd.append("subjectCode", form.subjectCode);
    fd.append("assessmentName", form.assessmentName);
    fd.append("maxMarks", form.maxMarks);
    if (isLecturer) fd.append("semester", form.semester);
    if (form.batchId) fd.append("batchId", form.batchId);
    if (file) fd.append("file", file);
    return fd;
  };

  const handlePreview = async () => {
    if (!file && !isEdit) {
      toast.error("Please choose an Excel/CSV file first.");
      return;
    }

    if (isLecturer && !form.batchId) {
      toast.error("Please select a batch before previewing marks.");
      return;
    }

    if (!file && isEdit) {
      toast.error("Choose a new file to preview, or submit directly to keep current rows.");
      return;
    }

    try {
      setLoading(true);
      const fd = buildFormData();
      const res = await API.post("/marks/preview", fd);
      setSummary(res.data.summary);
      setPreviewRows(res.data.validRows || []);
      setInvalidRows(res.data.invalidRows || []);
      toast.success("Preview generated successfully.");
    } catch (err) {
      setInvalidRows(err?.response?.data?.invalidRows || []);
      toast.error(err?.response?.data?.message || "Preview failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.subjectName || !form.subjectCode || !form.assessmentName || !form.maxMarks) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (isLecturer && !form.batchId) {
      toast.error("Please select a batch before saving marks.");
      return;
    }

    if (!isEdit && !file) {
      toast.error("Please choose a file for new upload.");
      return;
    }

    try {
      setSaving(true);
      const fd = buildFormData();

      const res = isEdit
        ? await API.put(`/marks/${id}`, fd)
        : await API.post("/marks", fd);

      toast.success(res.data.message || "Saved successfully.");
      setTimeout(() => {
        navigate("/batchrep-dashboard/list-marks");
      }, 600);
    } catch (err) {
      setInvalidRows(err?.response?.data?.invalidRows || []);
      toast.error(err?.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const hasPreview = summary || previewRows.length || invalidRows.length;

  return (
    <div className="min-h-screen bg-[#0f1419] p-6 md:p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold mb-2">
              {isEdit ? "Edit Assessment Marks" : "Add Assessment Marks"}
            </h1>
            <p className="text-gray-400">
              Upload student marks using Excel or CSV and preview the file before saving.
            </p>
          </div>

          <button
            onClick={() => navigate("/batchrep-dashboard/list-marks")}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-[#1a1f2e] px-5 py-3 font-semibold text-white transition hover:bg-[#22283a]"
          >
            <FaArrowLeft /> Back
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <form
              onSubmit={handleSave}
              className="rounded-2xl border border-gray-700 bg-[#1a1f2e] p-6 shadow-xl"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-blue-500/15 p-3 text-blue-300">
                  <FaFileUpload />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Marks Upload Form</h2>
                  <p className="text-sm text-gray-400">Enter assessment details and attach the marks file.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {isLecturer && (
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-300">Batch</label>
                    <select
                      name="batchId"
                      value={form.batchId}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-700 bg-[#0f1419] px-4 py-3 text-white outline-none transition focus:border-blue-500"
                    >
                      <option value="">Select a batch</option>
                      {batches.map((batch) => (
                        <option key={batch._id} value={batch._id}>
                          {batch.name || batch.batchCode || batch._id}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {isLecturer && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">Semester</label>
                    <select
                      name="semester"
                      value={form.semester}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-700 bg-[#0f1419] px-4 py-3 text-white outline-none transition focus:border-blue-500"
                    >
                      <option value="1">Semester 1</option>
                      <option value="2">Semester 2</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">Subject Name</label>
                  <input
                    name="subjectName"
                    value={form.subjectName}
                    onChange={handleChange}
                    placeholder="e.g. Database Systems"
                    className="w-full rounded-xl border border-gray-700 bg-[#0f1419] px-4 py-3 text-white placeholder-gray-500 outline-none transition focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">Subject Code</label>
                  <input
                    name="subjectCode"
                    value={form.subjectCode}
                    onChange={handleChange}
                    placeholder="e.g. IT304"
                    className="w-full rounded-xl border border-gray-700 bg-[#0f1419] px-4 py-3 text-white placeholder-gray-500 outline-none transition focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">Assessment Name</label>
                  <input
                    name="assessmentName"
                    value={form.assessmentName}
                    onChange={handleChange}
                    placeholder="e.g. Mid Exam 1"
                    className="w-full rounded-xl border border-gray-700 bg-[#0f1419] px-4 py-3 text-white placeholder-gray-500 outline-none transition focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">Maximum Marks</label>
                  <input
                    name="maxMarks"
                    type="number"
                    value={form.maxMarks}
                    onChange={handleChange}
                    placeholder="e.g. 100"
                    className="w-full rounded-xl border border-gray-700 bg-[#0f1419] px-4 py-3 text-white placeholder-gray-500 outline-none transition focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Upload Excel / CSV File
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="block w-full cursor-pointer rounded-xl border border-dashed border-gray-600 bg-[#0f1419] px-4 py-3 text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-blue-700"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Accepted columns: <span className="text-gray-300">student_id / marks</span> or any similar variant supported by backend.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handlePreview}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
                >
                  <FaEye /> Preview File
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <FaSave /> {saving ? "Saving..." : isEdit ? "Update Marks" : "Save Marks"}
                </button>
              </div>

              {loading && (
                <div className="mt-6 rounded-xl border border-gray-700 bg-[#0f1419] p-4 text-gray-400">
                  Loading...
                </div>
              )}
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-700 bg-[#1a1f2e] p-6 shadow-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-blue-500/15 p-3 text-blue-300">
                  <FaFileAlt />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Upload Help</h3>
                  <p className="text-sm text-gray-400">Quick file summary</p>
                </div>
              </div>

              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="mt-1 text-emerald-400" />
                  Fill all assessment fields before saving.
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="mt-1 text-emerald-400" />
                  Preview checks student IDs and marks before upload.
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="mt-1 text-emerald-400" />
                  Re-upload file only when you want to replace rows.
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="mt-1 text-emerald-400" />
                  Editing without file keeps existing student rows.
                </li>
              </ul>
            </div>

            {summary && (
              <div className="rounded-2xl border border-gray-700 bg-[#1a1f2e] p-6 shadow-xl">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl bg-purple-500/15 p-3 text-purple-300">
                    <FaChartBar />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Preview Summary</h3>
                    <p className="text-sm text-gray-400">Validated file overview</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-3 rounded-xl bg-[#0f1419] px-4 py-3">
                    <span className="text-gray-400">Subject</span>
                    <span className="font-semibold text-white">{summary.subjectName}</span>
                  </div>
                  <div className="flex justify-between gap-3 rounded-xl bg-[#0f1419] px-4 py-3">
                    <span className="text-gray-400">Code</span>
                    <span className="font-semibold text-white">{summary.subjectCode}</span>
                  </div>
                  <div className="flex justify-between gap-3 rounded-xl bg-[#0f1419] px-4 py-3">
                    <span className="text-gray-400">Assessment</span>
                    <span className="font-semibold text-white">{summary.assessmentName}</span>
                  </div>
                  <div className="flex justify-between gap-3 rounded-xl bg-[#0f1419] px-4 py-3">
                    <span className="text-gray-400">Max Marks</span>
                    <span className="font-semibold text-white">{summary.maxMarks}</span>
                  </div>
                  <div className="flex justify-between gap-3 rounded-xl bg-[#0f1419] px-4 py-3">
                    <span className="text-gray-400">Total Rows</span>
                    <span className="font-semibold text-white">{summary.totalRows}</span>
                  </div>
                  <div className="flex justify-between gap-3 rounded-xl bg-[#0f1419] px-4 py-3">
                    <span className="text-gray-400">Valid Rows</span>
                    <span className="font-semibold text-emerald-400">{summary.validRows}</span>
                  </div>
                  <div className="flex justify-between gap-3 rounded-xl bg-[#0f1419] px-4 py-3">
                    <span className="text-gray-400">Invalid Rows</span>
                    <span className="font-semibold text-red-400">{summary.invalidRows}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {previewRows.length > 0 && (
          <div className="mt-8 rounded-2xl border border-gray-700 bg-[#1a1f2e] p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Valid Preview Rows</h3>
                <p className="text-sm text-gray-400">Rows that passed validation and will be saved.</p>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-300">
                {previewRows.length} valid
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-700">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#111827]">
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Student ID</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Student Name</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, index) => (
                    <tr
                      key={index}
                      className={`border-t border-gray-700/60 ${
                        index % 2 === 0 ? "bg-[#0f1419]/40" : "bg-transparent"
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

        {invalidRows.length > 0 && (
          <div className="mt-8 rounded-2xl border border-gray-700 bg-[#1a1f2e] p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Invalid Rows</h3>
                <p className="text-sm text-gray-400">These rows must be corrected before saving.</p>
              </div>
              <span className="rounded-full bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-300">
                {invalidRows.length} invalid
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-700">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#111827]">
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Row</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {invalidRows.map((row, index) => (
                    <tr
                      key={index}
                      className={`border-t border-gray-700/60 ${
                        index % 2 === 0 ? "bg-[#0f1419]/40" : "bg-transparent"
                      }`}
                    >
                      <td className="px-4 py-4 text-gray-300">{row.row}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-2 text-red-300">
                          <FaExclamationTriangle className="mt-1 shrink-0" />
                          <span>{row.reason}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!hasPreview && !loading && !saving && (
          <div className="mt-8 rounded-2xl border border-gray-700 bg-[#1a1f2e] p-6 shadow-xl">
            <div className="flex items-center gap-3 text-gray-400">
              <FaEye className="text-blue-400" />
              <p>No preview data yet. Upload a file and click Preview File to check rows before saving.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddMarks;