import React, { useState, useEffect, useMemo } from "react";
import API from "../../api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaPlus, FaUpload, FaFileExcel, FaArrowLeft, FaCheck } from "react-icons/fa";

const AddBatch = () => {
  const [intakeYear, setIntakeYear] = useState("");
  const [monthName, setMonthName] = useState("");
  const [course, setCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [file, setFile] = useState(null);
  const [batches, setBatches] = useState([]);
  const [preview, setPreview] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [applying, setApplying] = useState(false);

  const navigate = useNavigate();

  const yearOptions = useMemo(() => {
    const now = new Date();
    const cy = now.getFullYear();
    const years = [];
    for (let y = cy - 5; y <= cy + 5; y++) years.push(y);
    return years;
  }, []);

  const monthOptions = [
    "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await API.get("/batch");
      const list = (res.data.batches || []).map(b => ({
        _id: b._id || b.id,
        name: b.name,
        course: b.course,
        batchCode: b.batchCode,
        intakeYear: b.intakeYear,
        createdAt: b.createdAt,
        raw: b
      }));
      setBatches(list);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load batches");
    }
  };

  const batchCode = useMemo(() => {
    if (!intakeYear || !monthName || !course) return "";
    const yy = String(intakeYear).slice(-2);
    const m = monthName.slice(0,3);
    return `${yy}${m}${course.replace(/\s+/g, "").toUpperCase()}`;
  }, [intakeYear, monthName, course]);

  const handleFileChange = (e) => setFile(e.target.files?.[0] || null);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!intakeYear || !monthName || !course) {
      return toast.error("Select intake year, month and enter course");
    }
    try {
      const payload = {
        name: monthName,
        intakeYear: Number(intakeYear),
        course: course.trim(),
        batchCode
      };
      const res = await API.post("/batch", payload);
      if (res.data?.batch) {
        toast.success("✅ New batch created successfully");
        setSelectedBatch(res.data.batch._id || res.data.batch.id);
        setIntakeYear("");
        setMonthName("");
        setCourse("");
        fetchBatches();
      } else {
        toast.error(res.data?.message || "Create failed");
      }
    } catch (err) {
      console.error("Create error", err);
      toast.error(err.response?.data?.message || "Create batch failed");
    }
  };

  const handlePreview = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Choose file");
    if (!selectedBatch) return toast.error("Select batch");
    const form = new FormData();
    form.append("file", file);
    form.append("semester", 1);
    try {
      const res = await API.post(`/batch/${selectedBatch}/upload-excel?commit=false`, form, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setPreview(res.data);
      setPreviewOpen(true);
    } catch (err) {
      console.error("Preview failed", err);
      toast.error(err.response?.data?.message || "Preview failed");
    }
  };

  const handleApply = async () => {
    if (!preview) return;
    setApplying(true);
    const form = new FormData();
    form.append("file", file);
    form.append("semester", 1);
    form.append("batchId", selectedBatch);
    try {
      const res = await API.post(`/batch/${selectedBatch}/upload-excel?commit=true`, form, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const s = res.data.summary || {};
      toast.success(`✅ Upload applied — new: ${s.newCount||0}, continuing: ${s.continuingCount||0}`);
      setPreview(null); setPreviewOpen(false); setFile(null);
      fetchBatches();
    } catch (err) {
      console.error("Apply failed", err);
      toast.error(err.response?.data?.message || "Apply failed");
    } finally { setApplying(false); }
  };

  const selectExistingBatch = (b) => {
    setSelectedBatch(b._id);
    toast.info(`✓ Selected ${b.name}`);
  };

  const resetUpload = () => { setFile(null); setPreview(null); setPreviewOpen(false); setSelectedBatch(""); };

  return (
    <div className="min-h-screen bg-[#0f1419] p-8 text-white overflow-y-auto">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate('/admin-dashboard')} className="text-gray-400 hover:text-white transition">
            <FaArrowLeft className="text-xl" />
          </button>
          <h1 className="text-5xl font-bold">Batch Management</h1>
        </div>
        <p className="text-gray-400">Create new batches or upload student data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Create Batch Card */}
        <div className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-gray-700 rounded-xl p-8 hover:border-blue-500 transition">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <FaPlus className="text-blue-500 text-lg" />
            </div>
            <h2 className="text-2xl font-bold">Create New Batch</h2>
          </div>

          <form onSubmit={handleCreate} className="space-y-5">
            {/* Intake Year */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Intake Year *</label>
              <select 
                value={intakeYear} 
                onChange={(e) => setIntakeYear(e.target.value)} 
                className="w-full bg-[#0f1419] border border-gray-700 text-white px-4 py-3 rounded-lg focus:border-blue-500 focus:outline-none transition"
              >
                <option value="">Select year</option>
                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Month */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Month *</label>
              <select 
                value={monthName} 
                onChange={(e) => setMonthName(e.target.value)} 
                className="w-full bg-[#0f1419] border border-gray-700 text-white px-4 py-3 rounded-lg focus:border-blue-500 focus:outline-none transition"
              >
                <option value="">Select month</option>
                {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Course */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Course *</label>
              <input 
                value={course} 
                onChange={(e) => setCourse(e.target.value)} 
                placeholder="e.g., Software Engineering" 
                className="w-full bg-[#0f1419] border border-gray-700 text-white px-4 py-3 rounded-lg focus:border-blue-500 focus:outline-none transition placeholder-gray-600"
              />
            </div>

            {/* Batch Code (Auto-generated) */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Batch Code (Auto-generated)</label>
              <input 
                value={batchCode} 
                readOnly 
                className="w-full bg-[#0f1419] border border-blue-500/50 text-blue-400 px-4 py-3 rounded-lg placeholder-gray-600"
              />
              <p className="text-xs text-gray-500 mt-2">Format: YYMonCOURSE (e.g., 23JanSE)</p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                <FaPlus /> Create Batch
              </button>
              <button 
                type="button" 
                onClick={() => { setIntakeYear(""); setMonthName(""); setCourse(""); }} 
                className="px-6 bg-[#1a1f2e] border border-gray-700 text-white font-semibold py-3 rounded-lg hover:border-gray-600 transition"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Upload Students Card */}
        <div className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-gray-700 rounded-xl p-8 hover:border-green-500 transition">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-500/20 p-3 rounded-lg">
              <FaUpload className="text-green-500 text-lg" />
            </div>
            <h2 className="text-2xl font-bold">Upload Students</h2>
          </div>

          <form className="space-y-5">
            {/* Select Batch */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Select Batch *</label>
              <select 
                value={selectedBatch} 
                onChange={(e) => setSelectedBatch(e.target.value)} 
                className="w-full bg-[#0f1419] border border-gray-700 text-white px-4 py-3 rounded-lg focus:border-green-500 focus:outline-none transition"
              >
                <option value="">--- Select batch ---</option>
                {batches.map(b => <option key={b._id} value={b._id}>{b.intakeYear} {b.name} - {b.course}</option>)}
              </select>
              <p className="text-xs text-gray-500 mt-2">Or create a new batch first</p>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Excel File (.xlsx, .xls, .csv) *</label>
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-green-500 transition cursor-pointer">
                <input 
                  type="file" 
                  accept=".xlsx,.xls,.csv" 
                  onChange={handleFileChange} 
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center gap-2">
                  <FaFileExcel className="text-3xl text-gray-500" />
                  <span className="text-sm text-gray-400">
                    {file ? file.name : "Click to upload or drag file"}
                  </span>
                  <span className="text-xs text-gray-500">Supports Excel and CSV formats</span>
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button 
                onClick={handlePreview} 
                disabled={!selectedBatch || !file} 
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FaCheck /> Preview Upload
              </button>
              <button 
                type="button"
                onClick={resetUpload} 
                className="px-6 bg-[#1a1f2e] border border-gray-700 text-white font-semibold py-3 rounded-lg hover:border-gray-600 transition"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Existing Batches Section */}
      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-6">Existing Batches</h2>
        {batches.length === 0 ? (
          <div className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-gray-700 rounded-xl p-8 text-center">
            <p className="text-gray-400">No batches created yet. Create one above to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map((b) => (
              <div 
                key={b._id} 
                onClick={() => selectExistingBatch(b)}
                className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-gray-700 rounded-xl p-6 hover:border-blue-500 cursor-pointer transition hover:shadow-lg"
              >
                <p className="text-lg font-bold text-white mb-2">{b.intakeYear} {b.name}</p>
                <p className="text-blue-400 font-semibold mb-1">{b.course}</p>
                <p className="text-xs text-gray-500">Code: {b.batchCode || 'N/A'}</p>
                <p className="text-xs text-gray-600 mt-3">Created: {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '—'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default AddBatch;
