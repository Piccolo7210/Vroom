import { toast } from 'react-toastify';

// Utility function to handle API responses
export const handleApiResponse = async (response, router = null) => {
  if (response.status === 401) {
    // Token expired or invalid
    toast.error('Session expired. Please login again.');
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    
    if (router) {
      router.push('/admin');
    } else if (typeof window !== 'undefined') {
      window.location.href = '/admin';
    }
    
    throw new Error('Authentication failed');
  }
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Request failed');
  }
  
  return response;
};

// Utility function to make authenticated API calls
export const authenticatedFetch = async (url, options = {}, router = null) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    toast.error('No authentication token found. Please login again.');
    if (router) {
      router.push('/admin');
    } else if (typeof window !== 'undefined') {
      window.location.href = '/admin';
    }
    throw new Error('No authentication token');
  }
  
  const defaultHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  const response = await fetch(url, {
    ...options,
    headers: defaultHeaders
  });
  
  return handleApiResponse(response, router);
};

// Function to check if token is still valid
export const validateToken = async (router = null) => {
  try {
    const response = await authenticatedFetch('http://localhost:5000/api/admin/profile', {}, router);
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Token validation failed:', error);
    return false;
  }
};

// Function to refresh token (if we implement refresh tokens in the future)
export const refreshToken = async () => {
  // This can be implemented later if needed
  // For now, we'll just extend the token expiration time
  return false;
};
