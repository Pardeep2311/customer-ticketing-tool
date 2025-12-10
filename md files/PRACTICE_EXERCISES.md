# 🏋️ Practice Exercises - Role-Based Navigation

## 🎯 Exercise 1: Basic Conditional Menu

**Task:** Create a simple component that shows different menu items based on role.

**Starter Code:**
```javascript
import React from 'react';

const Menu = ({ role }) => {
  // TODO: Add your code here
  return (
    <div>
      <h2>Menu</h2>
      {/* Add menu items here */}
    </div>
  );
};

export default Menu;
```

**Expected Output:**
- If role = "admin" → Show: ["Dashboard", "Users", "Settings"]
- If role = "customer" → Show: ["Dashboard", "My Tickets"]

**Solution:**
```javascript
const Menu = ({ role }) => {
  const items = role === "admin"
    ? ["Dashboard", "Users", "Settings"]
    : ["Dashboard", "My Tickets"];

  return (
    <div>
      <h2>Menu</h2>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
};
```

---

## 🎯 Exercise 2: Add Three Roles

**Task:** Support admin, employee, and customer with different menus.

**Requirements:**
- Admin: ["Dashboard", "All Tickets", "Users", "Settings"]
- Employee: ["Dashboard", "My Tickets", "Assigned Tickets"]
- Customer: ["Dashboard", "My Tickets", "Create Ticket"]

**Solution:**
```javascript
const Menu = ({ role }) => {
  const items = 
    role === "admin"
      ? ["Dashboard", "All Tickets", "Users", "Settings"]
    : role === "employee"
      ? ["Dashboard", "My Tickets", "Assigned Tickets"]
      : ["Dashboard", "My Tickets", "Create Ticket"];

  return (
    <div>
      <h2>Menu</h2>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
};
```

---

## 🎯 Exercise 3: Add Icons and Paths

**Task:** Add icons and navigation paths to menu items.

**Starter:**
```javascript
import { Home, Ticket, Users, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const Menu = ({ role }) => {
  // TODO: Add menu items with icons and paths
  return (
    <nav>
      {/* Render menu items */}
    </nav>
  );
};
```

**Solution:**
```javascript
import { Home, Ticket, Users, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const Menu = ({ role }) => {
  const items = role === "admin"
    ? [
        { icon: Home, label: "Dashboard", path: "/admin/dashboard" },
        { icon: Ticket, label: "All Tickets", path: "/admin/tickets" },
        { icon: Users, label: "Users", path: "/admin/users" },
        { icon: Settings, label: "Settings", path: "/admin/settings" }
      ]
    : [
        { icon: Home, label: "Dashboard", path: "/customer/dashboard" },
        { icon: Ticket, label: "My Tickets", path: "/customer/tickets" }
      ];

  return (
    <nav>
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <Link key={i} to={item.path}>
            <Icon /> {item.label}
          </Link>
        );
      })}
    </nav>
  );
};
```

---

## 🎯 Exercise 4: Add Badges/Counts

**Task:** Add badge counts to some menu items (e.g., "Unassigned (5)").

**Solution:**
```javascript
const Menu = ({ role }) => {
  const items = role === "admin"
    ? [
        { label: "Dashboard", path: "/admin/dashboard" },
        { label: "Unassigned", path: "/admin/unassigned", badge: 5 },
        { label: "Pending", path: "/admin/pending", badge: 3 }
      ]
    : [
        { label: "Dashboard", path: "/customer/dashboard" },
        { label: "My Tickets", path: "/customer/tickets" }
      ];

  return (
    <nav>
      {items.map((item, i) => (
        <Link key={i} to={item.path}>
          {item.label}
          {item.badge && (
            <span className="badge">{item.badge}</span>
          )}
        </Link>
      ))}
    </nav>
  );
};
```

---

## 🎯 Exercise 5: Collapsible Sections

**Task:** Create collapsible sections (like our real sidebar).

**Solution:**
```javascript
import React, { useState } from 'react';
import { Ticket, Settings, ChevronDown, ChevronRight } from 'lucide-react';

const Menu = ({ role }) => {
  const [expanded, setExpanded] = useState({ tickets: true, settings: false });

  const sections = role === "admin"
    ? [
        {
          id: "tickets",
          label: "Ticket Management",
          icon: Ticket,
          items: [
            { label: "All Tickets", path: "/admin/tickets" },
            { label: "Unassigned", path: "/admin/unassigned" }
          ]
        },
        {
          id: "settings",
          label: "Settings",
          icon: Settings,
          items: [
            { label: "Users", path: "/admin/users" }
          ]
        }
      ]
    : [
        {
          id: "tickets",
          label: "My Tickets",
          icon: Ticket,
          items: [
            { label: "All Tickets", path: "/customer/tickets" }
          ]
        }
      ];

  return (
    <nav>
      {sections.map((section) => {
        const SectionIcon = section.icon;
        const isExpanded = expanded[section.id];

        return (
          <div key={section.id}>
            <button onClick={() => setExpanded({...expanded, [section.id]: !isExpanded})}>
              <SectionIcon />
              {section.label}
              {isExpanded ? <ChevronDown /> : <ChevronRight />}
            </button>
            {isExpanded && (
              <div>
                {section.items.map((item, i) => (
                  <Link key={i} to={item.path}>{item.label}</Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};
```

---

## 🎯 Exercise 6: Get Role from Context

**Task:** Get user role from authentication context instead of props.

**Solution:**
```javascript
import { useAuth } from '../context/AuthContext';

const Menu = ({ userRole: propUserRole }) => {
  const { user } = useAuth();
  
  // Priority: prop → context → default
  const role = propUserRole || user?.role || 'customer';

  const items = role === "admin"
    ? [/* admin items */]
    : [/* customer items */];

  return (
    <nav>
      {items.map((item, i) => (
        <Link key={i} to={item.path}>{item.label}</Link>
      ))}
    </nav>
  );
};
```

---

## 🎯 Exercise 7: Active State Highlighting

**Task:** Highlight the active menu item based on current route.

**Solution:**
```javascript
import { useLocation } from 'react-router-dom';

const Menu = ({ role }) => {
  const location = useLocation();
  
  const items = role === "admin"
    ? [
        { label: "Dashboard", path: "/admin/dashboard" },
        { label: "Tickets", path: "/admin/tickets" }
      ]
    : [
        { label: "Dashboard", path: "/customer/dashboard" },
        { label: "Tickets", path: "/customer/tickets" }
      ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav>
      {items.map((item, i) => (
        <Link
          key={i}
          to={item.path}
          className={isActive(item.path) ? "active" : ""}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
};
```

---

## ✅ Check Your Understanding

After completing exercises, you should be able to:

- [ ] Create conditional menu items based on role
- [ ] Use ternary operator for simple conditions
- [ ] Use if-else for complex conditions
- [ ] Group roles using logical OR (`||`)
- [ ] Add icons and paths to menu items
- [ ] Create collapsible sections
- [ ] Get role from props or context
- [ ] Highlight active menu items

---

## 🎓 Interview Practice

**Practice explaining:**
1. "How do you implement role-based navigation?"
2. "What's the difference between ternary and if-else?"
3. "How do you handle multiple roles?"
4. "What's data-driven UI?"

Try explaining each concept out loud as if in an interview!

---

**Keep practicing! 🚀**

