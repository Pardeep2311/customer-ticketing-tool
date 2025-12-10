import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';

const SidebarToggleButton = () => {
  const { sidebarCollapsed, toggleSidebar } = useSidebar();

  return (
    <button
      onClick={toggleSidebar}
      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
      title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      {sidebarCollapsed ? (
        <PanelLeftOpen className="w-4 h-4 text-slate-700 dark:text-slate-300" />
      ) : (
        <PanelLeftClose className="w-4 h-4 text-slate-700 dark:text-slate-300" />
      )}
    </button>
  );
};

export default SidebarToggleButton;

