import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, Briefcase, Award, Users, PlusCircle, Building2, Calendar, CheckCircle2 } from 'lucide-react';

interface MockJob {
  id: string;
  company: string;
  role: string;
  status: 'Applied' | 'Interviewing' | 'Selected' | 'Rejected';
  date: string;
  salary: string;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<MockJob[]>([
    { id: '1', company: 'Google', role: 'Software Engineering Intern', status: 'Interviewing', date: '2026-06-12', salary: '$120,000/yr' },
    { id: '2', company: 'Meta', role: 'Frontend Developer', status: 'Selected', date: '2026-06-10', salary: '$145,000/yr' },
    { id: '3', company: 'Stripe', role: 'Backend Engineer', status: 'Applied', date: '2026-06-14', salary: '$130,000/yr' },
    { id: '4', company: 'Netflix', role: 'Systems Engineer', status: 'Rejected', date: '2026-06-05', salary: '$160,000/yr' },
  ]);

  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newSalary, setNewSalary] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newRole.trim()) return;

    const newJob: MockJob = {
      id: Date.now().toString(),
      company: newCompany,
      role: newRole,
      status: 'Applied',
      date: new Date().toISOString().split('T')[0],
      salary: newSalary || 'N/A',
    };

    setJobs([newJob, ...jobs]);
    setNewCompany('');
    setNewRole('');
    setNewSalary('');
    setShowForm(false);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Selected':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Interviewing':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Rejected':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-800';
    }
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
            onClick={() => setShowForm(!showForm)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-6 py-3.5 shadow-lg shadow-indigo-600/20 transition-all duration-200 cursor-pointer w-full md:w-auto self-start"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Add Job Application</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 flex items-center gap-5 hover:border-slate-800 transition-all duration-300">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Companies</p>
              <h3 className="text-2xl font-bold mt-0.5">24</h3>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 flex items-center gap-5 hover:border-slate-800 transition-all duration-300">
            <div className="h-12 w-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Active Openings</p>
              <h3 className="text-2xl font-bold mt-0.5">85</h3>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 flex items-center gap-5 hover:border-slate-800 transition-all duration-300">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Selected Students</p>
              <h3 className="text-2xl font-bold mt-0.5">142</h3>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 flex items-center gap-5 hover:border-slate-800 transition-all duration-300">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Placement Rate</p>
              <h3 className="text-2xl font-bold mt-0.5">82.4%</h3>
            </div>
          </div>
        </div>

        {/* Dynamic Mock Job Insertion Form */}
        {showForm && (
          <form onSubmit={handleAddJob} className="bg-slate-900/60 border border-slate-850 rounded-3xl p-8 space-y-6 shadow-xl animate-fadeIn">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-200">Track New Job Application</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-sm text-slate-400 hover:text-slate-200 cursor-pointer">
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Microsoft"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="mt-2 block w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400">Job Role</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Devops Architect"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="mt-2 block w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400">Package Offered</label>
                <input
                  type="text"
                  placeholder="e.g. $135,000/yr"
                  value={newSalary}
                  onChange={(e) => setNewSalary(e.target.value)}
                  className="mt-2 block w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200 text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm px-6 py-3 transition-all duration-200 cursor-pointer"
            >
              Add to Applications List
            </button>
          </form>
        )}

        {/* Dashboard Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Applications list (Left/Center columns) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-indigo-400" />
                <span>Active Job Applications</span>
              </h2>
              <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                Live Status
              </span>
            </div>

            <div className="overflow-hidden bg-slate-900/30 border border-slate-900 rounded-3xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-900/50">
                      <th className="px-6 py-4.5 text-xs font-semibold uppercase text-slate-400 tracking-wider">Job / Company</th>
                      <th className="px-6 py-4.5 text-xs font-semibold uppercase text-slate-400 tracking-wider">Salary Package</th>
                      <th className="px-6 py-4.5 text-xs font-semibold uppercase text-slate-400 tracking-wider">Applied On</th>
                      <th className="px-6 py-4.5 text-xs font-semibold uppercase text-slate-400 tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60">
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-900/20 transition-all duration-150">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-200">{job.company}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{job.role}</div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-300">
                          {job.salary}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {job.date}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${getStatusStyle(job.status)}`}>
                            {job.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Side Panels (Right column) */}
          <div className="space-y-8">
            {/* Announcements Panel */}
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
                    <span className="font-medium text-slate-200">{user?.email}</span>
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
    </div>
  );
};

export default Dashboard;
