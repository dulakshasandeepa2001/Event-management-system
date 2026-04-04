import React from 'react';
import { FaUserGraduate, FaUserCheck, FaClock, FaChartBar } from 'react-icons/fa';

const studentRows = [
  { id: 'IT2201', name: 'A. Silva', year: '2', semester: '1', status: 'Active' },
  { id: 'IT2202', name: 'R. Perera', year: '2', semester: '1', status: 'Active' },
  { id: 'IT2203', name: 'M. Fernando', year: '2', semester: '1', status: 'Pending Docs' },
  { id: 'IT2204', name: 'K. Nadeesha', year: '2', semester: '1', status: 'Active' },
];

const BatchrepStudents = () => {
  const activeCount = studentRows.filter((s) => s.status === 'Active').length;

  return (
    <div className='space-y-5'>
      <section className='rounded-2xl border border-cyan-300/10 bg-[#09122a] p-4 md:p-5'>
        <h2 className='text-xl font-semibold text-slate-100'>Batch Students</h2>
        <p className='mt-1 text-sm text-slate-400'>Quick view of student records and status.</p>

        <div className='mt-4 grid gap-3 md:grid-cols-3'>
          <article className='rounded-xl border border-cyan-300/10 bg-[#0d1734] p-3'>
            <p className='text-xs uppercase tracking-wider text-slate-400'>Total Students</p>
            <p className='mt-1 text-3xl font-bold text-slate-100'>{studentRows.length}</p>
          </article>
          <article className='rounded-xl border border-cyan-300/10 bg-[#0d1734] p-3'>
            <p className='text-xs uppercase tracking-wider text-slate-400'>Active</p>
            <p className='mt-1 text-3xl font-bold text-cyan-200'>{activeCount}</p>
          </article>
          <article className='rounded-xl border border-cyan-300/10 bg-[#0d1734] p-3'>
            <p className='text-xs uppercase tracking-wider text-slate-400'>Pending</p>
            <p className='mt-1 text-3xl font-bold text-amber-300'>{studentRows.length - activeCount}</p>
          </article>
        </div>
      </section>

      <section className='rounded-2xl border border-cyan-300/10 bg-[#09122a] p-4 md:p-5'>
        <h3 className='mb-4 text-lg font-semibold text-slate-100'>Student List</h3>

        <div className='overflow-x-auto'>
          <table className='min-w-full border-separate border-spacing-y-2 text-sm'>
            <thead>
              <tr className='text-left text-xs uppercase tracking-wider text-slate-400'>
                <th className='px-3 py-2'>Index</th>
                <th className='px-3 py-2'>Name</th>
                <th className='px-3 py-2'>Year</th>
                <th className='px-3 py-2'>Semester</th>
                <th className='px-3 py-2'>Status</th>
              </tr>
            </thead>
            <tbody>
              {studentRows.map((student) => (
                <tr key={student.id} className='rounded-xl bg-[#0d1734] text-slate-200'>
                  <td className='rounded-l-xl px-3 py-3'>{student.id}</td>
                  <td className='px-3 py-3'>{student.name}</td>
                  <td className='px-3 py-3'>{student.year}</td>
                  <td className='px-3 py-3'>{student.semester}</td>
                  <td className='rounded-r-xl px-3 py-3'>
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs ${student.status === 'Active' ? 'bg-cyan-500/15 text-cyan-200' : 'bg-amber-500/15 text-amber-200'}`}>
                      {student.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className='rounded-2xl border border-cyan-300/10 bg-[#09122a] p-4 md:p-5'>
        <div className='grid gap-3 text-sm text-slate-300 md:grid-cols-3'>
          <div className='flex items-center gap-2'><FaUserGraduate className='text-cyan-300' /> Student records</div>
          <div className='flex items-center gap-2'><FaUserCheck className='text-cyan-300' /> Enrollment status</div>
          <div className='flex items-center gap-2'><FaClock className='text-cyan-300' /> Updated weekly</div>
        </div>
      </section>
    </div>
  );
};

export default BatchrepStudents;
