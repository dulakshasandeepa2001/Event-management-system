import React, { useMemo } from 'react';
import { FaAward, FaBookOpen, FaChartLine } from 'react-icons/fa';

const results = [
  { module: 'Database Systems', code: 'CS2101', grade: 'A-', credits: 3 },
  { module: 'Software Engineering', code: 'CS2102', grade: 'B+', credits: 3 },
  { module: 'Data Structures', code: 'CS2103', grade: 'A', credits: 4 },
  { module: 'Computer Networks', code: 'CS2104', grade: 'B', credits: 3 },
  { module: 'Human Computer Interaction', code: 'CS2105', grade: 'A-', credits: 2 },
];

const gradePoints = {
  'A+': 4.0,
  A: 4.0,
  'A-': 3.7,
  'B+': 3.3,
  B: 3.0,
  'B-': 2.7,
  'C+': 2.3,
  C: 2.0,
  'C-': 1.7,
  D: 1.0,
  F: 0,
};

const StudentExamResults = () => {
  const totalCredits = useMemo(() => results.reduce((sum, item) => sum + item.credits, 0), []);

  const gpa = useMemo(() => {
    const weightedPoints = results.reduce((sum, item) => {
      const point = gradePoints[item.grade] ?? 0;
      return sum + point * item.credits;
    }, 0);

    return totalCredits ? (weightedPoints / totalCredits).toFixed(2) : '0.00';
  }, [totalCredits]);

  const excellentCount = useMemo(() => results.filter((item) => ['A+', 'A', 'A-'].includes(item.grade)).length, []);

  return (
    <div className='space-y-5 p-6 md:p-8'>
      <section className='rounded-2xl border border-blue-400/15 bg-[#121a2f] p-5'>
        <h2 className='text-2xl font-bold text-white'>Exam Results</h2>
        <p className='mt-1 text-sm text-slate-400'>Track your academic performance with module-wise grades and GPA.</p>

        <div className='mt-4 grid gap-3 md:grid-cols-3'>
          <article className='rounded-xl border border-blue-400/10 bg-[#0f172b] p-4'>
            <div className='flex items-center justify-between text-slate-400'>
              <span className='text-xs uppercase tracking-wider'>Current GPA</span>
              <FaChartLine className='text-blue-300' />
            </div>
            <p className='mt-2 text-3xl font-bold text-cyan-200'>{gpa}</p>
          </article>

          <article className='rounded-xl border border-blue-400/10 bg-[#0f172b] p-4'>
            <div className='flex items-center justify-between text-slate-400'>
              <span className='text-xs uppercase tracking-wider'>Total Credits</span>
              <FaBookOpen className='text-blue-300' />
            </div>
            <p className='mt-2 text-3xl font-bold text-white'>{totalCredits}</p>
          </article>

          <article className='rounded-xl border border-blue-400/10 bg-[#0f172b] p-4'>
            <div className='flex items-center justify-between text-slate-400'>
              <span className='text-xs uppercase tracking-wider'>Excellent Grades</span>
              <FaAward className='text-blue-300' />
            </div>
            <p className='mt-2 text-3xl font-bold text-emerald-300'>{excellentCount}</p>
          </article>
        </div>
      </section>

      <section className='rounded-2xl border border-blue-400/15 bg-[#121a2f] p-5'>
        <h3 className='mb-4 text-lg font-semibold text-white'>Semester Result Sheet</h3>

        <div className='overflow-x-auto'>
          <table className='min-w-full text-sm'>
            <thead>
              <tr className='border-b border-blue-400/15 text-left text-xs uppercase tracking-wider text-slate-400'>
                <th className='px-3 py-2'>Module</th>
                <th className='px-3 py-2'>Code</th>
                <th className='px-3 py-2'>Credits</th>
                <th className='px-3 py-2'>Grade</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item) => (
                <tr key={item.code} className='border-b border-blue-400/10 text-slate-200'>
                  <td className='px-3 py-3'>{item.module}</td>
                  <td className='px-3 py-3 text-slate-300'>{item.code}</td>
                  <td className='px-3 py-3'>{item.credits}</td>
                  <td className='px-3 py-3'>
                    <span className='rounded-full bg-cyan-500/15 px-2 py-1 text-xs text-cyan-200'>
                      {item.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default StudentExamResults;
