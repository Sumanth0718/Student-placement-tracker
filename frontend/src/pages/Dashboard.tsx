import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ClipboardList, 
  Briefcase, 
  Users, 
  PlusCircle, 
  Calendar, 
  CheckCircle2, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  AlertTriangle, 
  Loader2, 
  XCircle 
} from 'lucide-react';

interface Application {
  _id: string;
  companyName: string;
  role: string;
  ctc: string;
  applicationDate: string;
  status: 'Applied' | 'OA Scheduled' | 'OA Completed' | 'Interview' | 'Offer' | 'Rejected';
  notes?: string;
  createdAt?: string;
}

export const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  
  // Applications & Loading states
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Form States (Add)
  const [showAddForm, setShowAddForm] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [ctc, setCtc] = useState('');
  const [applicationDate, setApplicationDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<Application['status']>('Applied');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal States (Edit / Delete)
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [deletingApp, setDeletingApp] = useState<Application | null>(null);

  // Fetch Applications from backend
  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/applications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Failed to retrieve applications');
      }

      const data = await res.json();
      setApplications(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchApplications();
    }
  }, [token, fetchApplications]);

  // Create Application Submit Handler
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!companyName.trim() || !role.trim() || !ctc.trim() || !applicationDate || !status) {
      setFormError('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName,
          role,
          ctc,
          applicationDate,
          status,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create application');
      }

      setApplications((prev) => [data, ...prev]);
      
      // Reset Form State
      setCompanyName('');
      setRole('');
      setCtc('');
      setApplicationDate(new Date().toISOString().split('T')[0]);
      setStatus('Applied');
      setNotes('');
      setShowAddForm(false);
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Application Submit Handler
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/applications/${editingApp._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: editingApp.companyName,
          role: editingApp.role,
          ctc: editingApp.ctc,
          applicationDate: editingApp.applicationDate,
          status: editingApp.status,
          notes: editingApp.notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update application');
      }

      setApplications((prev) =>
        prev.map((app) => (app._id === data._id ? data : app))
      );
      setEditingApp(null);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Application Handler
  const handleDeleteConfirm = async () => {
    if (!deletingApp) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/applications/${deletingApp._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete application');
      }

      setApplications((prev) => prev.filter((app) => app._id !== deletingApp._id));
      setDeletingApp(null);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dynamic Statistics
  const totalApps = applications.length;
  const interviewCount = applications.filter((app) => app.status === 'Interview').length;
  const offerCount = applications.filter((app) => app.status === 'Offer').length;
  const rejectCount = applications.filter((app) => app.status === 'Rejected').length;

  // Local Search & Filtering Logic
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Helper for status badge colors
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Offer':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Interview':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'OA Scheduled':
      case 'OA Completed':
        return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
      case 'Applied':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'Rejected':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-800';
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 p-6 sm:p-8 md:p-12">
      <div className="mx-auto max-w-7xl space-y-10">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-8 border-b border-slate-900">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300 bg-clip-text text-transparent">
              Welcome, {user?.name}!
            </h1>
            <p className="mt-2 text-slate-400 text-sm sm:text-base">
              Manage student placements, schedule recruitment drives, and track job offers in real-time.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-6 py-3.5 shadow-lg shadow-indigo-600/20 transition-all duration-200 cursor-pointer w-full md:w-auto self-start"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Add Application</span>
          </button>
        </div>

        {/* Dynamic MongoDB-based Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 flex items-center gap-5 hover:border-slate-800 transition-all duration-300">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Total Applications</p>
              <h3 className="text-3xl font-bold mt-0.5">{loading ? '-' : totalApps}</h3>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 flex items-center gap-5 hover:border-slate-800 transition-all duration-300">
            <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Total Interviews</p>
              <h3 className="text-3xl font-bold mt-0.5">{loading ? '-' : interviewCount}</h3>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 flex items-center gap-5 hover:border-slate-800 transition-all duration-300">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Total Offers</p>
              <h3 className="text-3xl font-bold mt-0.5">{loading ? '-' : offerCount}</h3>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 flex items-center gap-5 hover:border-slate-800 transition-all duration-300">
            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Total Rejections</p>
              <h3 className="text-3xl font-bold mt-0.5">{loading ? '-' : rejectCount}</h3>
            </div>
          </div>
        </div>

        {/* Create Application Form (Toggled via "Add Application" button) */}
        {showAddForm && (
          <form onSubmit={handleAddSubmit} className="bg-slate-900/60 border border-slate-850 rounded-3xl p-8 space-y-6 shadow-xl animate-fadeIn">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-200">Track New Job Application</h2>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)} 
                className="text-sm text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {formError && (
              <div className="flex items-center gap-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Microsoft"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-2 block w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400">Job Role *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Frontend Engineer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-2 block w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400">CTC Package *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 15 LPA or $120k/yr"
                  value={ctc}
                  onChange={(e) => setCtc(e.target.value)}
                  className="mt-2 block w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400">Application Date *</label>
                <input
                  type="date"
                  required
                  value={applicationDate}
                  onChange={(e) => setApplicationDate(e.target.value)}
                  className="mt-2 block w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400">Status *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Application['status'])}
                  className="mt-2 block w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200 text-sm appearance-none"
                >
                  <option value="Applied" className="bg-slate-900 text-slate-200">Applied</option>
                  <option value="OA Scheduled" className="bg-slate-900 text-slate-200">OA Scheduled</option>
                  <option value="OA Completed" className="bg-slate-900 text-slate-200">OA Completed</option>
                  <option value="Interview" className="bg-slate-900 text-slate-200">Interview</option>
                  <option value="Offer" className="bg-slate-900 text-slate-200">Offer</option>
                  <option value="Rejected" className="bg-slate-900 text-slate-200">Rejected</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-slate-400">Application Notes</label>
                <textarea
                  placeholder="Details about rounds, referrers, or next action items..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-2 block w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200 text-sm resize-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm px-6 py-3.5 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Application'}
            </button>
          </form>
        )}

        {/* Dashboard Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Applications list (Left/Center columns) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Search and Filters Area */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/20 border border-slate-900 p-4 rounded-3xl">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by company or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-slate-850 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-slate-500 uppercase font-semibold hidden sm:inline">Filter:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-950/40 border border-slate-850 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 transition-all"
                >
                  <option value="All">All Statuses</option>
                  <option value="Applied">Applied</option>
                  <option value="OA Scheduled">OA Scheduled</option>
                  <option value="OA Completed">OA Completed</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-indigo-400" />
                <span>Job Applications Tracker</span>
              </h2>
            </div>

            {/* Loading / Error / Empty States */}
            {loading ? (
              <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-4" />
                <p className="text-slate-400 text-sm">Fetching your applications list...</p>
              </div>
            ) : error ? (
              <div className="bg-rose-500/5 border border-rose-500/10 rounded-3xl p-8 text-center text-rose-400">
                <AlertTriangle className="h-8 w-8 mx-auto mb-3" />
                <h4 className="font-semibold text-lg">Failed to load applications</h4>
                <p className="text-sm mt-1 opacity-80">{error}</p>
                <button 
                  onClick={fetchApplications}
                  className="mt-4 text-xs font-semibold px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 transition cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            ) : filteredApps.length === 0 ? (
              <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-12 text-center">
                <Briefcase className="h-10 w-10 text-slate-600 mx-auto mb-4" />
                <h4 className="font-semibold text-slate-300 text-lg">No Applications Found</h4>
                <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                  {applications.length === 0 
                    ? "You haven't tracked any applications yet. Click 'Add Application' above to log your first job."
                    : "No applications match your search query or status filters."}
                </p>
              </div>
            ) : (
              <div className="overflow-hidden bg-slate-900/30 border border-slate-900 rounded-3xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900 bg-slate-900/50">
                        <th className="px-6 py-4.5 text-xs font-semibold uppercase text-slate-400 tracking-wider">Job / Company</th>
                        <th className="px-6 py-4.5 text-xs font-semibold uppercase text-slate-400 tracking-wider">CTC</th>
                        <th className="px-6 py-4.5 text-xs font-semibold uppercase text-slate-400 tracking-wider">Applied On</th>
                        <th className="px-6 py-4.5 text-xs font-semibold uppercase text-slate-400 tracking-wider">Status</th>
                        <th className="px-6 py-4.5 text-xs font-semibold uppercase text-slate-400 tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/60">
                      {filteredApps.map((app) => (
                        <tr key={app._id} className="hover:bg-slate-900/20 transition-all duration-150 group">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-200">{app.companyName}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{app.role}</div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-300">
                            {app.ctc}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-400">
                            {formatDate(app.applicationDate)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${getStatusStyle(app.status)}`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2.5 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setEditingApp({ ...app })}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 border border-slate-800 transition cursor-pointer"
                                title="Edit Application"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setDeletingApp(app)}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/20 transition cursor-pointer"
                                title="Delete Application"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Side Panels (Right column) */}
          <div className="space-y-8">
            
            {/* Placement Calendar */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-400" />
                <span>Placement Calendar</span>
              </h2>
              <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 space-y-5">
                <div className="flex gap-4 items-start border-l-2 border-indigo-500 pl-4">
                  <div className="space-y-1">
                    <p className="text-xs text-indigo-400 font-bold uppercase">June 18, 2026</p>
                    <h4 className="text-sm font-semibold text-slate-200">Apple Campus Drive</h4>
                    <p className="text-xs text-slate-400">Pre-placement talk starts at 10:00 AM in Auditorium B.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start border-l-2 border-slate-800 pl-4">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 font-bold uppercase">June 21, 2026</p>
                    <h4 className="text-sm font-semibold text-slate-300">Resume Review Hackathon</h4>
                    <p className="text-xs text-slate-400">Get your profiles audited by top tech recruiters.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start border-l-2 border-slate-800 pl-4">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 font-bold uppercase">June 24, 2026</p>
                    <h4 className="text-sm font-semibold text-slate-300">Amazon Mock Interviews</h4>
                    <p className="text-xs text-slate-400">Registration closing soon. Make sure to sign up.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Summary Panel */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-400" />
                <span>Account Info</span>
              </h2>
              <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Email:</span>
                    <span className="font-medium text-slate-200 truncate max-w-[180px]">{user?.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">User Role:</span>
                    <span className="font-bold text-indigo-400 capitalize">{user?.role}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Status:</span>
                    <span className="font-semibold text-emerald-400">Active Profile</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Edit Application Modal */}
      {editingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-200">Edit Application Details</h3>
              <button 
                onClick={() => setEditingApp(null)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-850 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase">Company Name</label>
                  <input
                    type="text"
                    required
                    value={editingApp.companyName}
                    onChange={(e) => setEditingApp({ ...editingApp, companyName: e.target.value })}
                    className="mt-1.5 block w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase">Role</label>
                  <input
                    type="text"
                    required
                    value={editingApp.role}
                    onChange={(e) => setEditingApp({ ...editingApp, role: e.target.value })}
                    className="mt-1.5 block w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase">CTC Package</label>
                  <input
                    type="text"
                    required
                    value={editingApp.ctc}
                    onChange={(e) => setEditingApp({ ...editingApp, ctc: e.target.value })}
                    className="mt-1.5 block w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase">Application Date</label>
                  <input
                    type="date"
                    required
                    value={editingApp.applicationDate ? new Date(editingApp.applicationDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditingApp({ ...editingApp, applicationDate: e.target.value })}
                    className="mt-1.5 block w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase">Status</label>
                  <select
                    value={editingApp.status}
                    onChange={(e) => setEditingApp({ ...editingApp, status: e.target.value as Application['status'] })}
                    className="mt-1.5 block w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 appearance-none"
                  >
                    <option value="Applied">Applied</option>
                    <option value="OA Scheduled">OA Scheduled</option>
                    <option value="OA Completed">OA Completed</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase">Notes</label>
                  <textarea
                    rows={3}
                    value={editingApp.notes || ''}
                    onChange={(e) => setEditingApp({ ...editingApp, notes: e.target.value })}
                    className="mt-1.5 block w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-850 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-2xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-200">Delete Application</h3>
                <p className="text-slate-400 text-sm mt-1">
                  Are you sure you want to delete your application for <strong className="text-slate-200">{deletingApp.companyName}</strong> ({deletingApp.role})?
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingApp(null)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-850 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition cursor-pointer"
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
