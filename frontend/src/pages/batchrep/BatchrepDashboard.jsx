import BatchrepSidebar from './BatchrepSidebar'
import BatchrepNavbar from './BatchrepNavbar'
import { Outlet } from 'react-router-dom'

const BatchrepDashboard = () => {

    return (
        <div>
           <BatchrepSidebar/>

           <div className='flex-1 bg-gray-100 ml-48 h-screen'>
                <BatchrepNavbar  />
                <Outlet/>
            </div>
        </div>
    );
};

export default BatchrepDashboard;