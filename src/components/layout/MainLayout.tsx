import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function MainLayout() {
  return (
    <div className="flex h-screen w-screen bg-[#1a1a2e] text-white overflow-hidden">
      {/* Sidebar - Fixed width, fixed height */}
      <Sidebar />

      {/* Main Content Area - Flexible width, fixed height */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#f1f5f9]">
        {/* Topbar - Fixed height */}
        <Topbar />

        {/* Content Outlet - Flexible height, scrollable internally if needed */}
        <main className="flex-1 p-8 overflow-hidden">
          <div className="h-full w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}