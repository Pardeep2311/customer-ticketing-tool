import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Lock, 
  Save, 
  Eye, 
  EyeOff, 
  Upload, 
  X, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Shield,
  Camera,
  Activity,
  AlertCircle,
  Building2
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Input from '../components/ui/input';
import Label from '../components/ui/label';
import { updateProfile } from '../api/users';
import { getCurrentUser } from '../api/auth';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser, checkAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [emailVerified, setEmailVerified] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [activityLog, setActivityLog] = useState([]);

  useEffect(() => {
    // Load current user data
    const loadUserData = async () => {
      try {
        const response = await getCurrentUser();
        if (response.success) {
          setFormData({
            name: response.data.name || '',
            email: response.data.email || '',
            company: response.data.company || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
          
          // Load profile image from localStorage if exists
          const savedImage = localStorage.getItem(`profile_image_${response.data.id}`);
          if (savedImage) {
            setProfileImagePreview(savedImage);
          }
          
          // Check email verification status (mock for now, can be from API)
          setEmailVerified(response.data.email_verified || false);
          
          // Load activity log from localStorage
          const savedActivity = localStorage.getItem(`activity_log_${response.data.id}`);
          if (savedActivity) {
            setActivityLog(JSON.parse(savedActivity));
          } else {
            // Initialize with default activities
            const defaultActivities = [
              {
                id: 1,
                action: 'Account Created',
                timestamp: response.data.created_at,
                type: 'account'
              }
            ];
            setActivityLog(defaultActivities);
            localStorage.setItem(`activity_log_${response.data.id}`, JSON.stringify(defaultActivities));
          }
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        toast.error('Failed to load profile data');
      }
    };

    loadUserData();
  }, []);

  // Calculate password strength
  useEffect(() => {
    if (formData.newPassword) {
      let strength = 0;
      const password = formData.newPassword;
      
      // Length check
      if (password.length >= 8) strength += 1;
      if (password.length >= 12) strength += 1;
      
      // Character variety checks
      if (/[a-z]/.test(password)) strength += 1;
      if (/[A-Z]/.test(password)) strength += 1;
      if (/[0-9]/.test(password)) strength += 1;
      if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
      
      setPasswordStrength(Math.min(strength, 5));
    } else {
      setPasswordStrength(0);
    }
  }, [formData.newPassword]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // If new password is provided, validate password fields
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required to change password';
      }

      if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters';
      }

      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
      };

      // Add company field for customers
      if (authUser?.role === 'customer') {
        updateData.company = formData.company.trim();
      }

      // Only include password fields if new password is provided
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await updateProfile(updateData);

      if (response.success) {
        toast.success('Profile updated successfully');
        
        // Save profile image if uploaded
        if (profileImagePreview && authUser?.id) {
          localStorage.setItem(`profile_image_${authUser.id}`, profileImagePreview);
        }
        
        // Add activity log entry
        if (authUser?.id) {
          const newActivity = {
            id: Date.now(),
            action: 'Profile Updated',
            timestamp: new Date().toISOString(),
            type: 'profile',
            details: 'Profile information was updated'
          };
          const updatedLog = [newActivity, ...activityLog].slice(0, 10); // Keep last 10 activities
          setActivityLog(updatedLog);
          localStorage.setItem(`activity_log_${authUser.id}`, JSON.stringify(updatedLog));
        }
        
        // Refresh auth context
        await checkAuth();
        
        // Clear password fields
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setErrors({});
        setPasswordStrength(0);
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      admin: 'Administrator',
      employee: 'Employee',
      customer: 'Customer',
    };
    return roleMap[role] || role;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(file);
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setProfileImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (authUser?.id) {
      localStorage.removeItem(`profile_image_${authUser.id}`);
    }
    toast.success('Profile picture removed');
  };

  const getPasswordStrengthLabel = (strength) => {
    if (strength === 0) return { text: '', color: '' };
    if (strength <= 2) return { text: 'Weak', color: 'text-red-700 bg-red-100' };
    if (strength === 3) return { text: 'Fair', color: 'text-yellow-700 bg-yellow-100' };
    if (strength === 4) return { text: 'Good', color: 'text-blue-700 bg-blue-100' };
    return { text: 'Strong', color: 'text-green-700 bg-green-100' };
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength <= 2) return 'bg-red-600';
    if (strength === 3) return 'bg-yellow-500';
    if (strength === 4) return 'bg-blue-600';
    return 'bg-green-600';
  };

  const formatActivityTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex h-screen bg-[#93d1ff]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="text-sm text-gray-600">Manage your account settings</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Profile Header Card - Redesigned */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <div className="flex items-start gap-6">
                  {/* Profile Picture Section */}
                  <div className="relative group">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                      {profileImagePreview ? (
                        <img 
                          src={profileImagePreview} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-4xl font-bold">
                          {authUser?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-white text-blue-600 p-2.5 rounded-full shadow-lg hover:bg-blue-50 transition-all hover:scale-110 border-2 border-blue-600"
                      title="Upload profile picture"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                    {profileImagePreview && (
                      <button
                        onClick={handleRemoveImage}
                        className="absolute top-0 right-0 bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition-all hover:scale-110"
                        title="Remove profile picture"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  <div className="flex-1 text-white">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold">{authUser?.name || 'User'}</h2>
                      {emailVerified ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white shadow-md" title="Email Verified">
                          <CheckCircle className="w-4 h-4" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-white shadow-md" title="Email Not Verified">
                          <AlertCircle className="w-4 h-4" />
                          Unverified
                        </span>
                      )}
                    </div>
                    <p className="text-blue-100 flex items-center gap-2 mb-1">
                      <Mail className="w-4 h-4" />
                      {authUser?.email || ''}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <p className="text-blue-100 flex items-center gap-2 text-sm">
                        <Shield className="w-4 h-4" />
                        {getRoleDisplay(authUser?.role)}
                      </p>
                      {authUser?.company && (
                        <p className="text-blue-100 flex items-center gap-2 text-sm">
                          <Building2 className="w-4 h-4" />
                          {authUser.company}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <p className="text-xs font-medium text-blue-600 mb-1">Account Created</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDate(authUser?.created_at)}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <p className="text-xs font-medium text-green-600 mb-1">Account Status</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {authUser?.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <p className="text-xs font-medium text-purple-600 mb-1">Role</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {getRoleDisplay(authUser?.role)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Profile Form - Redesigned */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Edit Profile Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div>
                  <Label htmlFor="name" className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
                    <User className="w-4 h-4 text-blue-600" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className={`!bg-white !text-gray-900 border-2 ${errors.name ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'} rounded-lg px-4 py-2.5`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
                    <Mail className="w-4 h-4 text-blue-600" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`!bg-white !text-gray-900 border-2 ${errors.email ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'} rounded-lg px-4 py-2.5`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Company Field - Only for Customers */}
                {authUser?.role === 'customer' && (
                  <div className="md:col-span-2">
                    <Label htmlFor="company" className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      Company Name
                    </Label>
                    <Input
                      id="company"
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={handleChange}
                      className={`!bg-white !text-gray-900 border-2 ${errors.company ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'} rounded-lg px-4 py-2.5`}
                      placeholder="Enter your company name (optional)"
                    />
                    {errors.company && (
                      <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.company}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Change Password Section - Redesigned */}
              <div className="mt-8 pt-8 border-t-2 border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Change Password</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Leave password fields empty if you don't want to change your password.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Current Password */}
                  <div>
                    <Label htmlFor="currentPassword" className="mb-2 text-sm font-semibold text-gray-700">
                      Current Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className={`!bg-white !text-gray-900 border-2 pr-10 ${errors.currentPassword ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'} rounded-lg px-4 py-2.5`}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.currentPassword}
                      </p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <Label htmlFor="newPassword" className="mb-2 text-sm font-semibold text-gray-700">
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={handleChange}
                        className={`!bg-white !text-gray-900 border-2 pr-10 ${errors.newPassword ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'} rounded-lg px-4 py-2.5`}
                        placeholder="Enter new password (min 6 characters)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {/* Password Strength Indicator - Fixed Colors */}
                    {formData.newPassword && (
                      <div className="mt-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-gray-300">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-gray-700">Password Strength:</span>
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${getPasswordStrengthLabel(passwordStrength).color} border-2 ${
                            passwordStrength <= 2 ? 'border-red-500' : 
                            passwordStrength === 3 ? 'border-yellow-500' : 
                            passwordStrength === 4 ? 'border-blue-500' : 
                            'border-green-500'
                          }`}>
                            {getPasswordStrengthLabel(passwordStrength).text}
                          </span>
                        </div>
                        <div className="w-full bg-gray-300 rounded-full h-4 mb-3 overflow-hidden shadow-inner">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${getPasswordStrengthColor(passwordStrength)} shadow-md`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          />
                        </div>
                        <div className="mt-2 text-xs text-gray-600 space-y-1">
                          {formData.newPassword.length < 8 && (
                            <div className="flex items-center gap-1.5">
                              <XCircle className="w-3 h-3 text-red-500" />
                              <span>Use at least 8 characters</span>
                            </div>
                          )}
                          {!/[a-z]/.test(formData.newPassword) && (
                            <div className="flex items-center gap-1.5">
                              <XCircle className="w-3 h-3 text-red-500" />
                              <span>Add lowercase letters</span>
                            </div>
                          )}
                          {!/[A-Z]/.test(formData.newPassword) && (
                            <div className="flex items-center gap-1.5">
                              <XCircle className="w-3 h-3 text-red-500" />
                              <span>Add uppercase letters</span>
                            </div>
                          )}
                          {!/[0-9]/.test(formData.newPassword) && (
                            <div className="flex items-center gap-1.5">
                              <XCircle className="w-3 h-3 text-red-500" />
                              <span>Add numbers</span>
                            </div>
                          )}
                          {!/[^a-zA-Z0-9]/.test(formData.newPassword) && (
                            <div className="flex items-center gap-1.5">
                              <XCircle className="w-3 h-3 text-red-500" />
                              <span>Add special characters</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {errors.newPassword && (
                      <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.newPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="md:col-span-2">
                  <Label htmlFor="confirmPassword" className="mb-2 text-sm font-semibold text-gray-700">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`!bg-white !text-gray-900 border-2 pr-10 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'} rounded-lg px-4 py-2.5`}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8 pt-6 border-t-2 border-gray-200 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn-cancel-gradient px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105 shadow-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-submit-gradient px-8 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105 shadow-md"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Account Activity Log - Redesigned */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Account Activity</h3>
              </div>
              <div className="space-y-3">
                {activityLog.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No activity recorded yet</p>
                  </div>
                ) : (
                  activityLog.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{activity.action}</p>
                        {activity.details && (
                          <p className="text-xs text-gray-600 mt-1">{activity.details}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatActivityTime(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

