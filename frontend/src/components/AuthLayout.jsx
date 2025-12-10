import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-black p-4 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full flex items-center justify-center max-h-full overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;

