import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api";
import { toast } from "react-toastify";

const EditMarks = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    subjectName: "",
    subjectCode: "",
    assessmentName: "",
    maxMarks: "",
  });

  const [file, setFile] = useState(null);
  const [existingRows, setExistingRows] = useState([]);

  // ✅ Load existing data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/marks/${id}`);
      const data = res.data.data;

      setForm({
        subjectName: data.subjectName,
        subjectCode: data.subjectCode,
        assessmentName: data.assessmentName,
        maxMarks: data.maxMarks,
      });

      setExistingRows(data.rows || []);
    } catch (err) {
      toast.error("Failed to load marks");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("subjectName", form.subjectName);
      formData.append("subjectCode", form.subjectCode);
      formData.append("assessmentName", form.assessmentName);
      formData.append("maxMarks", form.maxMarks);

      if (file) {
        formData.append("file", file);
      }

      await API.put(`/marks/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("✅ Marks updated successfully");
      navigate("/batchrep-dashboard/list-marks");
    } catch (err) {
      console.error(err);

      if (err.response?.data?.invalidRows) {
        toast.error("Fix invalid rows before updating");
        console.table(err.response.data.invalidRows);
      } else {
        toast.error(err.response?.data?.message || "Update failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1419] text-white p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Edit Marks</h1>
          <p className="text-gray-400">
            Update assessment details or upload a new marks file
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#1a1f2e] border border-gray-700 rounded-xl p-6 space-y-6"
        >

          {/* Subject */}
          <div>
            <label className="block mb-2 text-sm text-gray-400">Subject Name</label>
            <input
              name="subjectName"
              value={form.subjectName}
              onChange={handleChange}
              required
              className="w-full bg-[#0f1419] border border-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Code */}
          <div>
            <label className="block mb-2 text-sm text-gray-400">Subject Code</label>
            <input
              name="subjectCode"
              value={form.subjectCode}
              onChange={handleChange}
              required
              className="w-full bg-[#0f1419] border border-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Assessment */}
          <div>
            <label className="block mb-2 text-sm text-gray-400">Assessment Name</label>
            <input
              name="assessmentName"
              value={form.assessmentName}
              onChange={handleChange}
              required
              className="w-full bg-[#0f1419] border border-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Max Marks */}
          <div>
            <label className="block mb-2 text-sm text-gray-400">Max Marks</label>
            <input
              type="number"
              name="maxMarks"
              value={form.maxMarks}
              onChange={handleChange}
              required
              className="w-full bg-[#0f1419] border border-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block mb-2 text-sm text-gray-400">
              Upload New File (optional)
            </label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => setFile(e.target.files[0])}
              className="text-gray-300"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to keep existing marks
            </p>
          </div>

          {/* Existing Data Preview */}
          {!file && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Existing Records</h3>
              <div className="max-h-60 overflow-auto border border-gray-700 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-[#0f1419]">
                    <tr>
                      <th className="p-2 text-left">Student ID</th>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {existingRows.map((r, i) => (
                      <tr key={i} className="border-t border-gray-700">
                        <td className="p-2">{r.studentId}</td>
                        <td className="p-2">{r.studentName}</td>
                        <td className="p-2">{r.marks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold"
            >
              {loading ? "Updating..." : "Update Marks"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/batchrep-dashboard/list-marks")}
              className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMarks;