import Sidebar from './Sidebar';

const DashboardLayout = ({ children, userRole = 'customer' }) => {
  return (
    <div className="flex h-screen bg-[#93d1ff] overflow-hidden">
      {/* SIDEBAR - Let Sidebar handle its own collapse */}
      <Sidebar userRole={userRole} />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

