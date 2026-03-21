import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import {
  FaArrowLeft,
  FaFileCsv,
  FaEdit,
  FaSyncAlt,
  FaBan,
  FaTrashAlt,
  FaUpload,
} from "react-icons/fa";
import API from "../../api";
import { toast } from "react-toastify";
import ConfirmModal from "../components/ConfirmModal";


const BatchView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // edit drawer
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCourse, setEditCourse] = useState("");

  // confirm modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // upload preview
  const [uploadFile, setUploadFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [applying, setApplying] = useState(false);

  const fetchBatch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await API.get(`/batch/${id}`);
      // backend returns { batch, students, studentCount, activeCount }
      setBatch(res.data.batch || null);
      setStudents(res.data.students || []);
    } catch (err) {
      console.error("Failed to load batch:", err);
      toast.error("Failed to load batch");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBatch();
  }, [fetchBatch]);

  /* ---------- Actions: activate / deactivate / delete / edit ---------- */
  const openConfirm = (action) => {
    setConfirmAction(action);
    setConfirmOpen(true);
  };

  const doConfirm = async () => {
    if (!confirmAction || !batch) return setConfirmOpen(false);
    try {
      if (confirmAction === "deactivate") {
        await API.patch(`/batch/${batch._id}/deactivate`);
        toast.success(`Batch "${batch.name}" deactivated`);
      } else if (confirmAction === "activate") {
        await API.patch(`/batch/${batch._id}/activate`);
        toast.success(`Batch "${batch.name}" activated`);
      } else if (confirmAction === "delete") {
        await API.delete(`/batch/${batch._id}`);
        toast.success(`Batch "${batch.name}" deleted`);
        navigate("/admin-dashboard/list-batch");
        return;
      }
      // refresh
      fetchBatch();
    } catch (err) {
      console.error("Action failed:", err);
      const msg = err.response?.data?.message || "Action failed";
      toast.error(msg);
    } finally {
      setConfirmOpen(false);
      setConfirmAction(null);
    }
  };

  const startEdit = () => {
    if (!batch) return;
    setEditName(batch.name || "");
    setEditCourse(batch.course || "");
    setEditing(true);
  };

  const submitEdit = async () => {
    if (!batch) return;
    try {
      await API.put(`/batch/${batch._id}`, { name: editName, course: editCourse });
      toast.success("Batch updated");
      setEditing(false);
      fetchBatch();
    } catch (err) {
      console.error("Edit failed:", err);
      toast.error(err.response?.data?.message || "Edit failed");
    }
  };

  /* ---------- Activation codes export (single batch) ---------- */
  const exportActivationCodes = async () => {
    if (!batch) return;
    if (!batch.studentCount || batch.studentCount===0){
      return toast.info("No students in this batch to export.")
    }

    try {
      const res = await API.get(`/batch/${batch._id}/activation-codes`, { responseType: "blob" });
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `activation_codes_${(batch.name || batch._id).replace(/\s+/g, "_")}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Activation codes exported");
    } catch (err) {
        if (err.response?.status === 404) {
          toast.info(err.response.data?.message || "No students found for this batch");
        } else {
          toast.error(err.response?.data?.message || "Export failed");
        }
    }
  };

  /* ---------- Upload excel preview & apply ---------- */
  const onFileChange = (e) => {
    setUploadFile(e.target.files?.[0] || null);
  };

  const doPreviewUpload = async () => {
    if (!uploadFile || !batch) return toast.error("Select a file and batch");
    const form = new FormData();
    form.append("file", uploadFile);
    form.append("semester", 1);
    try {
      const res = await API.post(`/batch/${batch._id}/upload-excel?commit=false`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPreview(res.data);
      setPreviewOpen(true);
    } catch (err) {
      console.error("Preview error:", err);
      toast.error(err.response?.data?.message || "Preview failed");
    }
  };

  const doApplyUpload = async () => {
    if (!uploadFile || !batch) return toast.error("No preview to apply");
    setApplying(true);
    const form = new FormData();
    form.append("file", uploadFile);
    form.append("semester", 1);
    form.append("batchId", batch._id);
    try {
      const res = await API.post(`/batch/${batch._id}/upload-excel?commit=true`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const s = res.data.summary || {};
      toast.success(`Upload applied — new: ${s.newCount || 0}, continuing: ${s.continuingCount || 0}, removed: ${s.removedCount || 0}`);
      setPreview(null);
      setPreviewOpen(false);
      setUploadFile(null);
      fetchBatch();
    } catch (err) {
      console.error("Apply error:", err);
      toast.error(err.response?.data?.message || "Apply failed");
    } finally {
      setApplying(false);
    }
  };

  /* ---------- Students table ---------- */
  const columns = useMemo(
    () => [
      { name: "RegNo", selector: (r) => r.u_regno || "—", sortable: true, cell: (r) => <div className="font-medium">{r.u_regno || "—"}</div> },
      { name: "Name", selector: (r) => r.u_name || r.u_name, sortable: true, cell: (r) => <div>{r.u_name}</div> },
      { name: "Email", selector: (r) => r.u_email || "", sortable: true, cell: (r) => <div className="text-sm text-gray-700">{r.u_email}</div> },
      { name: "Status", selector: (r) => (r.u_isActive ? "Active" : "Inactive"), sortable: true, cell: (r) => <div className={r.u_isActive ? "text-green-600 text-sm" : "text-red-600 text-sm"}>{r.u_isActive ? "Active" : "Inactive"}</div> },
    ],
    []
  );

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded hover:bg-gray-100" title="Back">
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-2xl font-semibold">{batch?.name ?? "Batch details"}</h1>
            <div className="text-sm text-gray-500">{batch?.course ?? "—"} {batch?.intakeYear ? `• Intake ${batch.intakeYear}` : ""}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${batch?.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {batch?.isActive ? "Active" : "Deactivated"}
          </div>

          <button onClick={startEdit} className="px-3 py-1 border rounded hover:bg-gray-50" title="Edit batch"><FaEdit /></button>

          {batch?.isActive ? (
            <button onClick={() => openConfirm("deactivate")} className="px-3 py-1 border rounded hover:bg-gray-50 text-orange-600" title="Deactivate batch"><FaBan /></button>
          ) : (
            <button onClick={() => openConfirm("activate")} className="px-3 py-1 border rounded hover:bg-gray-50 text-green-600" title="Activate batch"><FaSyncAlt /></button>
          )}

          <button onClick={() => openConfirm("delete")} className="px-3 py-1 border rounded hover:bg-gray-50 text-red-600" title="Delete batch"><FaTrashAlt /></button>

          <button onClick={exportActivationCodes} className="px-3 py-1 border rounded hover:bg-gray-50 text-blue-600" title="Export activation codes"><FaFileCsv /></button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white rounded shadow-sm">
          <div className="text-xs text-gray-500">Students</div>
          <div className="text-xl font-semibold">{batch ? (batch.studentCount ?? students.length) : "-"}</div>
        </div>
        <div className="p-4 bg-white rounded shadow-sm">
          <div className="text-xs text-gray-500">Active</div>
          <div className="text-xl font-semibold">{batch ? (batch.activeCount ?? students.filter(s => s.u_isActive).length) : "-"}</div>
        </div>
        <div className="p-4 bg-white rounded shadow-sm">
          <div className="text-xs text-gray-500">Groups</div>
          <div className="text-xl font-semibold">{(batch?.groups || []).length}</div>
        </div>
      </div>

      {/* Upload area */}
      <div className="mb-6 p-4 bg-white rounded shadow-sm flex items-center gap-4">
        <input type="file" accept=".xlsx,.xls,.csv" onChange={onFileChange} />
        <button onClick={doPreviewUpload} disabled={!uploadFile} className="px-3 py-1 flex items-center bg-green-600 text-white rounded hover:bg-green-700"><FaUpload className="mr-2"/> Preview</button>
        <div className="text-sm text-gray-500">Upload Excel to add/update students for this batch (preview before apply).</div>
      </div>
 
      {/* Students table */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-semibold">Students</div>
          <div className="text-sm text-gray-500">{students.length} students</div>
        </div>

        <div className="p-4">
          <DataTable
            columns={columns}
            data={students}
            pagination
            progressPending={loading}
            highlightOnHover
            persistTableHead
          />
        </div>
      </div>

      {/* Edit drawer */}
      {editing && (
        <div className="fixed right-6 bottom-6 z-50 p-4 bg-white border rounded shadow-lg w-96">
          <h3 className="font-semibold mb-2">Edit Batch</h3>
          <div className="mb-2">
            <label className="text-sm">Batch Name</label>
            <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div className="mb-4">
            <label className="text-sm">Course</label>
            <input value={editCourse} onChange={(e) => setEditCourse(e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setEditing(false)} className="px-3 py-1 border rounded">Cancel</button>
            <button onClick={submitEdit} className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
          </div>
        </div>
      )}

      {/* Confirm modal */}
      <ConfirmModal
        show={confirmOpen}
        message={
          confirmAction === "deactivate"
            ? `Are you sure you want to deactivate batch "${batch?.name}"? This will also deactivate students.`
            : confirmAction === "activate"
            ? `Are you sure you want to activate batch "${batch?.name}"? This will also reactivate students.`
            : `Are you sure you want to permanently delete batch "${batch?.name}"?`
        }
        onConfirm={doConfirm}
        onCancel={() => { setConfirmOpen(false); setConfirmAction(null); }}
      />

      {/* Upload preview modal */}
      {previewOpen && preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setPreviewOpen(false)} />
          <div className="relative z-10 w-full max-w-3xl bg-white rounded-lg shadow-lg overflow-auto p-6">
            <h3 className="text-lg font-semibold mb-2">Upload Preview</h3>
            <p className="mb-2">Summary: new <strong>{preview.summary?.newCount || 0}</strong>, continuing <strong>{preview.summary?.continuingCount || 0}</strong>, removed <strong>{preview.summary?.removedCount || 0}</strong></p>

            {preview.errors && preview.errors.length > 0 && (
              <div className="mb-3 text-sm text-red-600">
                <p>Errors found:</p>
                <ul className="list-disc ml-6">
                  {preview.errors.map((er, i) => <li key={i}>Row {er.row}: {er.message}</li>)}
                </ul>
              </div>
            )}

            <div className="max-h-64 overflow-auto border rounded p-2 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="p-1">RegNo</th>
                    <th className="p-1">Name</th>
                    <th className="p-1">Email</th>
                    <th className="p-1">Group</th>
                  </tr>
                </thead>
                <tbody>
                  {(preview.preview || []).map((r, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-1">{r.regno}</td>
                      <td className="p-1">{r.name}</td>
                      <td className="p-1">{r.email}</td>
                      <td className="p-1">{r.group}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => { setPreviewOpen(false); setPreview(null); }} className="px-4 py-1 border rounded bg-gray-200">Cancel</button>
              <button onClick={doApplyUpload} disabled={applying} className="px-4 py-1 border rounded bg-blue-600 text-white">
                {applying ? "Applying..." : "Confirm & Apply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchView;