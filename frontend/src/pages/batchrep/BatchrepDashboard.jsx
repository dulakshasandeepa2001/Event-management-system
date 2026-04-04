import BatchrepSidebar from './BatchrepSidebar'
import BatchrepNavbar from './BatchrepNavbar'
import { Outlet } from 'react-router-dom'

const BatchrepDashboard = () => {

    return (
<<<<<<< HEAD
        <div>
           <BatchrepSidebar/>

           <div className='flex-1 bg-gray-100 ml-48 h-screen'>
                <BatchrepNavbar  />
                <Outlet/>
=======
        <div className='min-h-screen bg-[#050b18] text-slate-100 my_font_family'>
           <BatchrepSidebar />

           <div className='lg:pl-72'>
                <BatchrepNavbar />
                <main className='p-4 md:p-6 lg:p-8'>
                    <Outlet />
                </main>
>>>>>>> ra_new_part
            </div>
        </div>
    );
};

export default BatchrepDashboard;