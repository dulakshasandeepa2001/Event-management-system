import BatchrepSidebar from './BatchrepSidebar'
import BatchrepNavbar from './BatchrepNavbar'
import { Outlet } from 'react-router-dom'

const BatchrepDashboard = () => {

    return (
        <div className='min-h-screen bg-[#050b18] text-slate-100 my_font_family'>
           <BatchrepSidebar />

           <div className='lg:pl-72'>
                <BatchrepNavbar />
                <main className='p-4 md:p-6 lg:p-8'>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default BatchrepDashboard;