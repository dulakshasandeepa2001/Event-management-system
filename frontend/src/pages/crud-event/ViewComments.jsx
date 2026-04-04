import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";
import API from "../../api";

const ViewComments = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [eventTitle, setEventTitle] = useState("");

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/event/${id}/details`);
      setComments(res.data?.comments || []);
      setEventTitle(res.data?.event?.title || "");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load comments");
      navigate("/batchrep-dashboard/list-event");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1419] text-white flex items-center justify-center">
        <p className="text-gray-400">Loading comments...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white p-6 md:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white transition"
          >
            <FaArrowLeft className="text-xl" />
          </button>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold">All Comments</h1>
            <p className="text-gray-400 text-sm">{eventTitle}</p>
          </div>
        </div>

        {/* Comments */}
        {comments.length === 0 ? (
          <div className="bg-[#1a1f2e] border border-gray-700 rounded-xl p-6 text-center">
            <p className="text-gray-400">No comments yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((item) => (
              <div
                key={item._id}
                className="bg-[#1a1f2e] border border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-semibold">{item.user?.u_name || "Student"}</p>
                    <p className="text-xs text-gray-500">
                      {item.user?.u_course || ""} {item.user?.u_batchCode || ""}
                    </p>
                  </div>

                  <p className="text-xs text-gray-500">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : ""}
                  </p>
                </div>

                <p className="text-gray-300">{item.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewComments;