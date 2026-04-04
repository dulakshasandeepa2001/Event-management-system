import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  FaCalendarAlt,
  FaClock,
  FaEdit,
  FaEye,
  FaPlus,
  FaRegCalendarCheck,
  FaSave,
  FaSearch,
  FaSync,
  FaTrash,
  FaUsers,
} from 'react-icons/fa';
import API from '../../api';

const groupOptions = ['All', 'Group 1', 'Group 2', 'Group 3', 'Group 4', 'Group 5'];
const categoryOptions = ['Academic', 'Sports', 'Workshop', 'Social', 'Other'];
const statusOptions = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'];

const initialForm = {
  title: '',
  description: '',
  category: 'Academic',
  eventDate: '',
  startTime: '08:00',
  endTime: '',
  location: '',
  batchId: '',
  targetGroups: ['All'],
  status: 'Upcoming',
};

const today = new Date().toISOString().split('T')[0];

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [searchDraft, setSearchDraft] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchData = async () => {
    setLoading(true);

    try {
      const [eventsRes, batchesRes] = await Promise.all([
        API.get('/event'),
        API.get('/batch'),
      ]);

      setEvents(eventsRes.data?.events || []);
      setBatches(batchesRes.data?.batches || []);
    } catch (err) {
      console.error('Failed to load admin events:', err);
      toast.error(err.response?.data?.message || 'Failed to load events');
      setEvents([]);
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const scrollToForm = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setSearchTerm(searchDraft.trim());
  };

  const handleClearFilters = () => {
    setSearchDraft('');
    setSearchTerm('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setBatchFilter('all');
  };

  const toggleGroup = (group) => {
    if (group === 'All') {
      setForm((prev) => ({ ...prev, targetGroups: ['All'] }));
      return;
    }

    setForm((prev) => {
      const withoutAll = prev.targetGroups.filter((item) => item !== 'All');

      if (withoutAll.includes(group)) {
        const next = withoutAll.filter((item) => item !== group);
        return {
          ...prev,
          targetGroups: next.length ? next : ['All'],
        };
      }

      return {
        ...prev,
        targetGroups: [...withoutAll, group],
      };
    });
  };

  const startCreate = () => {
    resetForm();
    scrollToForm();
  };

  const startEdit = (event) => {
    setEditingId(event._id);
    setForm({
      title: event.title || '',
      description: event.description || '',
      category: event.category || 'Academic',
      eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : '',
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      location: event.location || '',
      batchId: event.batch?._id || event.batch || '',
      targetGroups: Array.isArray(event.targetGroups) && event.targetGroups.length ? event.targetGroups : ['All'],
      status: event.status || 'Upcoming',
    });
    setSelectedEvent(null);
    scrollToForm();
  };

  const filteredEvents = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return events.filter((event) => {
      if (categoryFilter !== 'all' && event.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && event.status !== statusFilter) return false;
      if (batchFilter !== 'all' && String(event.batch?._id || event.batch) !== batchFilter) return false;

      if (q) {
        const haystack = [
          event.title,
          event.description,
          event.location,
          event.category,
          event.status,
          event.batch?.name,
          event.batch?.course,
          event.createdBy?.u_name,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [events, searchTerm, categoryFilter, statusFilter, batchFilter]);

  const eventStats = useMemo(() => {
    const activeBatchIds = new Set();
    let upcomingSoon = 0;

    filteredEvents.forEach((event) => {
      if (event.batch?._id || event.batch) {
        activeBatchIds.add(String(event.batch?._id || event.batch));
      }

      if (event.status === 'Upcoming' && event.eventDate) {
        const due = new Date(event.eventDate);
        const diff = due.getTime() - Date.now();
        if (diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000) {
          upcomingSoon += 1;
        }
      }
    });

    return [
      { label: 'Total Events', value: events.length, accent: 'text-cyan-300', bg: 'bg-cyan-500/10' },
      { label: 'Upcoming', value: events.filter((event) => event.status === 'Upcoming').length, accent: 'text-emerald-300', bg: 'bg-emerald-500/10' },
      { label: 'Ongoing', value: events.filter((event) => event.status === 'Ongoing').length, accent: 'text-amber-300', bg: 'bg-amber-500/10' },
      { label: 'This Week', value: upcomingSoon, accent: 'text-violet-300', bg: 'bg-violet-500/10' },
      { label: 'Batches', value: activeBatchIds.size, accent: 'text-sky-300', bg: 'bg-sky-500/10' },
    ];
  }, [events, filteredEvents]);

  const handleFormChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const title = form.title.trim();
    const description = form.description.trim();
    const location = form.location.trim();

    if (title.length < 3 || title.length > 120) {
      toast.error('Event title must be between 3 and 120 characters');
      return;
    }

    if (description.length < 10 || description.length > 1200) {
      toast.error('Description must be between 10 and 1200 characters');
      return;
    }

    if (!form.eventDate || form.eventDate < today) {
      toast.error('Event date must be today or later');
      return;
    }

    if (!form.batchId) {
      toast.error('Please select a batch');
      return;
    }

    if (location.length > 120) {
      toast.error('Location must be 120 characters or fewer');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title,
        description,
        category: form.category,
        eventDate: form.eventDate,
        startTime: form.startTime,
        endTime: form.endTime,
        location,
        batchId: form.batchId,
        targetGroups: form.targetGroups,
        status: form.status,
      };

      if (editingId) {
        await API.put(`/event/${editingId}`, payload);
        toast.success('Event updated successfully');
      } else {
        await API.post('/event', payload);
        toast.success('Event created successfully');
      }

      resetForm();
      setRefreshKey((value) => value + 1);
    } catch (err) {
      console.error('Failed to save event:', err);
      toast.error(err.response?.data?.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?._id) return;

    try {
      await API.delete(`/event/${deleteTarget._id}`);
      toast.success('Event deleted');
      setDeleteTarget(null);
      if (selectedEvent?._id === deleteTarget._id) {
        setSelectedEvent(null);
      }
      setRefreshKey((value) => value + 1);
    } catch (err) {
      console.error('Failed to delete event:', err);
      toast.error(err.response?.data?.message || 'Failed to delete event');
    }
  };

  const batchLabel = (event) => {
    const batch = event.batch;
    if (!batch) return 'No batch';
    return `${batch.intakeYear || ''} ${batch.name || ''}${batch.course ? ` - ${batch.course}` : ''}`.trim();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#10192a] to-[#0b1220] p-8 text-white">
      <div className="space-y-8">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                <FaCalendarAlt /> Admin Events
              </div>
              <h1 className="text-4xl font-black tracking-tight md:text-5xl">Event Command Center</h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Create, filter, review, and manage every event from one admin workspace. The page is built to keep the event flow visible without forcing you through batchrep screens.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setRefreshKey((value) => value + 1)}
                className="inline-flex items-center gap-2 rounded-xl border border-sky-400/30 bg-sky-500/10 px-4 py-3 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/20"
              >
                <FaSync className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                type="button"
                onClick={startCreate}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-cyan-600"
              >
                <FaPlus />
                New Event
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {eventStats.map((card) => (
            <div key={card.label} className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/10 backdrop-blur">
              <div className={`mb-4 inline-flex rounded-xl ${card.bg} p-3`}>
                <FaRegCalendarCheck className={card.accent} />
              </div>
              <p className="text-sm text-slate-400">{card.label}</p>
              <p className="mt-2 text-3xl font-black text-white">{card.value}</p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_1.45fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Event Form</h2>
                <p className="mt-1 text-sm text-slate-400">Create or update an event without leaving the page.</p>
              </div>

              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                >
                  Cancel edit
                </button>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-300">Title *</span>
                  <input
                    value={form.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#0f1419] px-4 py-3 text-white outline-none transition focus:border-cyan-400/60"
                    placeholder="Event title"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-300">Category *</span>
                  <select
                    value={form.category}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#0f1419] px-4 py-3 text-white outline-none transition focus:border-cyan-400/60"
                  >
                    {categoryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="space-y-2 block">
                <span className="text-sm font-semibold text-slate-300">Description *</span>
                <textarea
                  value={form.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  rows={5}
                  className="w-full rounded-2xl border border-white/10 bg-[#0f1419] px-4 py-3 text-white outline-none transition focus:border-cyan-400/60"
                  placeholder="Describe the event, its purpose, and anything the audience should know"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-300">Event Date *</span>
                  <input
                    type="date"
                    value={form.eventDate}
                    min={today}
                    onChange={(e) => handleFormChange('eventDate', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#0f1419] px-4 py-3 text-white outline-none transition focus:border-cyan-400/60"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-300">Batch *</span>
                  <select
                    value={form.batchId}
                    onChange={(e) => handleFormChange('batchId', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#0f1419] px-4 py-3 text-white outline-none transition focus:border-cyan-400/60"
                  >
                    <option value="">Select batch</option>
                    {batches.map((batch) => (
                      <option key={batch._id || batch.id} value={batch._id || batch.id}>
                        {batch.intakeYear} {batch.name} - {batch.course}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-300">Start Time</span>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => handleFormChange('startTime', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#0f1419] px-4 py-3 text-white outline-none transition focus:border-cyan-400/60"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-300">End Time</span>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => handleFormChange('endTime', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#0f1419] px-4 py-3 text-white outline-none transition focus:border-cyan-400/60"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-300">Location</span>
                  <input
                    value={form.location}
                    onChange={(e) => handleFormChange('location', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#0f1419] px-4 py-3 text-white outline-none transition focus:border-cyan-400/60"
                    placeholder="Venue, hall, or online meeting link"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-300">Status</span>
                  <select
                    value={form.status}
                    onChange={(e) => handleFormChange('status', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#0f1419] px-4 py-3 text-white outline-none transition focus:border-cyan-400/60"
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-slate-300">Target Groups</p>
                <div className="flex flex-wrap gap-3">
                  {groupOptions.map((group) => (
                    <button
                      key={group}
                      type="button"
                      onClick={() => toggleGroup(group)}
                      className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                        form.targetGroups.includes(group)
                          ? 'border-cyan-400/40 bg-cyan-500/15 text-cyan-100'
                          : 'border-white/10 bg-[#0f1419] text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FaSave className={saving ? 'animate-pulse' : ''} />
                  {saving ? 'Saving...' : editingId ? 'Update Event' : 'Create Event'}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Event Registry</h2>
                <p className="mt-1 text-sm text-slate-400">Search, filter, preview, and manage every event.</p>
              </div>

              <div className="text-sm text-slate-400">
                Showing {filteredEvents.length} of {events.length} events
              </div>
            </div>

            <form className="grid grid-cols-1 gap-3 xl:grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr_auto]" onSubmit={handleSearchSubmit}>
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0f1419] px-4 py-3 focus-within:border-cyan-400/60 xl:col-span-1">
                <FaSearch className="text-slate-400" />
                <input
                  value={searchDraft}
                  onChange={(e) => setSearchDraft(e.target.value)}
                  type="text"
                  placeholder="Search by title, batch, or creator"
                  className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                />
              </label>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-2xl border border-white/10 bg-[#0f1419] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60"
              >
                <option value="all">All categories</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-2xl border border-white/10 bg-[#0f1419] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60"
              >
                <option value="all">All statuses</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="rounded-2xl border border-white/10 bg-[#0f1419] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60"
              >
                <option value="all">All batches</option>
                {batches.map((batch) => (
                  <option key={batch._id || batch.id} value={batch._id || batch.id}>
                    {batch.intakeYear} {batch.name}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-cyan-600"
              >
                <FaSearch />
                Search
              </button>
            </form>

            <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
              <button
                type="button"
                onClick={handleClearFilters}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200 transition hover:bg-white/10"
              >
                Clear filters
              </button>
              <span>Filter state updates immediately after search.</span>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10">
                  <thead className="bg-[#0f1419]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Event</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Batch</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Schedule</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/10 bg-[#0b1220]">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                          <div className="inline-flex items-center gap-3">
                            <FaSync className="animate-spin" />
                            Loading events...
                          </div>
                        </td>
                      </tr>
                    ) : filteredEvents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                          No events found for the current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredEvents.map((event, index) => (
                        <tr key={event._id} className={`transition hover:bg-white/5 ${index % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                          <td className="px-4 py-4 align-top">
                            <div className="space-y-2">
                              <div className="flex items-start gap-3">
                                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                  <FaCalendarAlt className="text-cyan-300" />
                                </div>
                                <div>
                                  <p className="font-semibold text-white">{event.title}</p>
                                  <p className="mt-1 max-w-md text-sm text-slate-400 line-clamp-2">{event.description}</p>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-200">
                                      {event.category || 'Academic'}
                                    </span>
                                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-200">
                                      {event.createdBy?.u_name || 'System'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4 align-top text-sm text-slate-300">
                            <div className="space-y-1">
                              <p className="font-semibold text-white">{batchLabel(event)}</p>
                              <p className="text-slate-500">{event.location || 'No location set'}</p>
                            </div>
                          </td>

                          <td className="px-4 py-4 align-top text-sm text-slate-300">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <FaClock className="text-cyan-300" />
                                <span>{event.eventDate ? new Date(event.eventDate).toLocaleDateString('en-GB') : '—'}</span>
                              </div>
                              <p className="text-slate-500">
                                {event.startTime || 'Start not set'}{event.endTime ? ` - ${event.endTime}` : ''}
                              </p>
                              <div className="flex items-center gap-2 text-slate-500">
                                <FaUsers className="text-cyan-300" />
                                <span>{Array.isArray(event.targetGroups) && event.targetGroups.length ? event.targetGroups.join(', ') : 'All'}</span>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                                event.status === 'Upcoming'
                                  ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-100'
                                  : event.status === 'Ongoing'
                                    ? 'border-amber-400/30 bg-amber-500/15 text-amber-100'
                                    : event.status === 'Completed'
                                      ? 'border-violet-400/30 bg-violet-500/15 text-violet-100'
                                      : 'border-rose-400/30 bg-rose-500/15 text-rose-100'
                              }`}
                            >
                              {event.status || 'Upcoming'}
                            </span>
                          </td>

                          <td className="px-4 py-4 align-top">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedEvent(event)}
                                className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
                              >
                                <FaEye />
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => startEdit(event)}
                                className="inline-flex items-center gap-2 rounded-xl border border-sky-400/25 bg-sky-500/10 px-3 py-2 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/20"
                              >
                                <FaEdit />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(event)}
                                className="inline-flex items-center gap-2 rounded-xl border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20"
                              >
                                <FaTrash />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>

      {selectedEvent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#101827] p-6 shadow-2xl shadow-black/40">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Event Details</p>
                <h3 className="mt-2 text-3xl font-bold text-white">{selectedEvent.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Batch</p>
                <p className="mt-1 font-semibold text-white">{batchLabel(selectedEvent)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Category</p>
                <p className="mt-1 font-semibold text-white">{selectedEvent.category || 'Academic'}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Date and Time</p>
                <p className="mt-1 font-semibold text-white">
                  {selectedEvent.eventDate ? new Date(selectedEvent.eventDate).toLocaleDateString('en-GB') : '—'}
                  {selectedEvent.startTime ? ` • ${selectedEvent.startTime}` : ''}
                  {selectedEvent.endTime ? ` - ${selectedEvent.endTime}` : ''}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Status</p>
                <p className="mt-1 font-semibold text-white">{selectedEvent.status || 'Upcoming'}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Location</p>
              <p className="mt-1 font-semibold text-white">{selectedEvent.location || 'No location set'}</p>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Target Groups</p>
              <p className="mt-1 font-semibold text-white">
                {Array.isArray(selectedEvent.targetGroups) && selectedEvent.targetGroups.length
                  ? selectedEvent.targetGroups.join(', ')
                  : 'All'}
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Description</p>
              <p className="mt-1 whitespace-pre-wrap text-slate-200">{selectedEvent.description}</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  startEdit(selectedEvent);
                  setSelectedEvent(null);
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-cyan-600"
              >
                <FaEdit />
                Edit Event
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(selectedEvent);
                  setSelectedEvent(null);
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20"
              >
                <FaTrash />
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#101827] p-6 shadow-2xl shadow-black/40">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-200">Delete event</p>
            <h3 className="mt-2 text-2xl font-bold text-white">Remove this event?</h3>
            <p className="mt-3 text-sm text-slate-300">
              This will permanently delete <span className="font-semibold text-white">{deleteTarget.title}</span> from the event registry.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-600"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminEvents;