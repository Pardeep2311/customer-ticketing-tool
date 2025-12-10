import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Sparkles, User, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/button';
import Input from '../components/ui/input';
import Label from '../components/ui/label';
import Checkbox from '../components/ui/checkbox';
import AuthLayout from '../components/AuthLayout';
import logo from '../images/logo.png';
import { toast } from 'sonner';
import { login as apiLogin } from '../api/auth';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [loginType, setLoginType] = useState('customer'); // 'customer' or 'admin'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Handle login type change
  const handleLoginTypeChange = (type) => {
    setLoginType(type);
    // Clear form when switching types
    setFormData({
      email: '',
      password: '',
      rememberMe: formData.rememberMe,
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiLogin({
        email: formData.email,
        password: formData.password,
      });

      if (response.success) {
        const user = response.data.user;
        // Normalize role to lowercase and trim any whitespace
        const role = (user.role || '').toString().toLowerCase().trim();
        
        console.log('Login successful - User details:', {
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          userRole: role,
          selectedLoginType: loginType,
          tokenPresent: !!response.data.token
        });
        
        // VALIDATE: Check if user's role matches the selected login portal
        const isAdminOrEmployee = role === 'admin' || role === 'employee';
        const isCustomer = role === 'customer';
        const selectedAdminPortal = loginType === 'admin';
        const selectedCustomerPortal = loginType === 'customer';
        
        // Check for role mismatch
        if (selectedAdminPortal && !isAdminOrEmployee) {
          // User selected Admin/Employee portal but has customer role
          toast.error('Access Denied', {
            description: 'This account is for Customer access. Please select "Customer" login type.',
          });
          setIsLoading(false);
          return;
        }
        
        if (selectedCustomerPortal && isAdminOrEmployee) {
          // User selected Customer portal but has admin/employee role
          toast.error('Access Denied', {
            description: 'This account is for Admin/Employee access. Please select "Admin/Employee" login type.',
          });
          setIsLoading(false);
          return;
        }
        
        // Role matches selected portal - proceed with login
        login(user, response.data.token);
        
        toast.success('Welcome back!', {
          description: `Logged in as ${user.name}`,
        });

        // Redirect based on role (which matches the selected portal)
        let redirectPath = '/customer/dashboard'; // Default fallback
        
        if (isAdminOrEmployee) {
          redirectPath = '/admin/dashboard';
          console.log('Redirecting admin/employee to:', redirectPath);
        } else if (isCustomer) {
          redirectPath = '/customer/dashboard';
          console.log('Redirecting customer to:', redirectPath);
        } else {
          console.warn('Unknown role detected:', role, '- Redirecting to customer dashboard');
          redirectPath = '/customer/dashboard';
        }
        
        // Use replace to prevent back button issues
        navigate(redirectPath, { replace: true });
      } else {
        console.error('Login failed - response:', response);
        toast.error('Login failed', {
          description: response.message || 'Invalid credentials',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please check your credentials and try again.';
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'Cannot connect to server. Please check if the backend is running.';
      } else {
        // Something else happened
        errorMessage = error.message || errorMessage;
      }
      
      toast.error('Login failed', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md animate-fade-in">
        {/* Card with glass morphism effect */}
        <div className="relative">
          {/* Glow effect behind card */}
          <div className="absolute -inset-1 bg-gradient-primary opacity-20 blur-xl rounded-2xl"></div>
          
          <div className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl p-6">
            {/* Logo and header */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-xl mb-3 shadow-sm border border-gray-200">
                <img src={logo} alt="Cantik Logo" className="w-12 h-12 object-contain" />
              </div>
              <h1 className="text-2xl font-bold mb-1 bg-gradient-primary bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="text-sm text-gray-400">Login to continue to Cantik</p>
            </div>

            {/* Login Type Selector - UI Only, redirect is based on actual user role */}
            <div className="mb-4">
              <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
                <button
                  type="button"
                  onClick={() => handleLoginTypeChange('customer')}
                  className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-md transition-all text-sm ${
                    loginType === 'customer'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="font-medium">Customer</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLoginTypeChange('admin')}
                  className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-md transition-all text-sm ${
                    loginType === 'admin'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span className="font-medium">Admin/Employee</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Select the correct portal for your account type
              </p>
            </div>

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Email field */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="pl-10 h-10 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-10 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, rememberMe: checked }))
                    }
                  />
                  <Label htmlFor="rememberMe" className="text-xs text-gray-400 cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 text-sm mt-2"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Logging in...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Log In</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-900/80 px-2 text-gray-400">New to Cantik?</span>
              </div>
            </div>

            {/* Sign up link */}
            <div className="text-center">
              <Link
                to="/register"
                className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors inline-flex items-center space-x-1"
              >
                <span>Create an account</span>
                <span className="text-base">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
