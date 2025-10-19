import React from 'react';

interface AdminPanelProps {
  children: React.ReactNode;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ children }) => {
  return (
    <div className="admin-panel">
      <header className="admin-header">
        <h1>Content Management System</h1>
        <nav className="admin-nav">
          <ul>
            <li>Dashboard</li>
            <li>Content</li>
            <li>Users</li>
            <li>Analytics</li>
            <li>Settings</li>
          </ul>
        </nav>
      </header>
      
      <main className="admin-content">
        {children}
      </main>
      
      <footer className="admin-footer">
        <p>© {new Date().getFullYear()} New World Kids CMS</p>
      </footer>
    </div>
  );
};

export default AdminPanel;
