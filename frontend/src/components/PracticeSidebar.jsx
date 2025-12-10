/**
 * 🎓 PRACTICE COMPONENT - Role-Based Navigation
 * 
 * This is a simplified version to help you learn!
 * Try modifying this code to understand how it works.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Ticket, 
  Users, 
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

/**
 * STEP 1: Understand the component structure
 * - It receives `userRole` as a prop
 * - It conditionally shows different menu items
 */
const PracticeSidebar = ({ userRole = 'customer' }) => {
  const [expanded, setExpanded] = useState(true);

  /**
   * STEP 2: This is the KEY part - Conditional Data Selection
   * 
   * Read this as:
   * "IF userRole is 'admin' OR 'employee', 
   *  THEN use the first array (admin/employee menu)
   *  ELSE use the second array (customer menu)"
   */
  const menuItems = (userRole === 'admin' || userRole === 'employee')
    ? [
        // 👇 ADMIN/EMPLOYEE MENU ITEMS
        { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Ticket, label: 'All Tickets', path: '/admin/tickets' },
        { icon: Ticket, label: 'Unassigned Tickets', path: '/admin/tickets/unassigned' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
      ]
    : [
        // 👇 CUSTOMER MENU ITEMS
        { icon: Home, label: 'Dashboard', path: '/customer/dashboard' },
        { icon: Ticket, label: 'My Tickets', path: '/customer/tickets' },
        { icon: Ticket, label: 'Create Ticket', path: '/tickets/create' },
      ];

  /**
   * STEP 3: Rendering
   * - We use .map() to loop through menuItems
   * - Same rendering code works for all roles!
   * - Only the DATA changes based on role
   */
  return (
    <div className="w-64 bg-gray-800 text-white p-4">
      <h2 className="text-lg font-bold mb-4">Navigation</h2>
      
      {/* Show current role for learning */}
      <div className="mb-4 p-2 bg-gray-700 rounded text-sm">
        <strong>Current Role:</strong> {userRole}
      </div>

      {/* Menu Items */}
      <nav className="space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon; // Get the icon component
          
          return (
            <Link
              key={index}
              to={item.path}
              className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700 transition-colors"
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Learning Section */}
      <div className="mt-8 p-4 bg-gray-700 rounded text-xs">
        <h3 className="font-bold mb-2">💡 How it works:</h3>
        <ol className="list-decimal list-inside space-y-1 text-gray-300">
          <li>Check userRole (admin/employee/customer)</li>
          <li>Select menu items based on role</li>
          <li>Render the selected items</li>
        </ol>
        <p className="mt-2 text-gray-400">
          Try changing the userRole prop to see different menus!
        </p>
      </div>
    </div>
  );
};

export default PracticeSidebar;

/**
 * 🧪 HOW TO USE THIS COMPONENT:
 * 
 * // In your parent component:
 * 
 * // Show admin menu
 * <PracticeSidebar userRole="admin" />
 * 
 * // Show customer menu
 * <PracticeSidebar userRole="customer" />
 * 
 * // Show employee menu (same as admin)
 * <PracticeSidebar userRole="employee" />
 */

/**
 * 📝 EXERCISES TO TRY:
 * 
 * 1. Add a new menu item for admin only
 * 2. Add a new menu item for customer only
 * 3. Create a third menu for "manager" role
 * 4. Add icons to menu items
 * 5. Add a badge/count to some items
 */

