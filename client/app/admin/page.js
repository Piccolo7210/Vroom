'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLoginForm } from './components/AdminLoginForm';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
         console.log(data);
      if (response.ok) {
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('userType', 'admin');
        
        // Store user data in localStorage
        const userData = {
          name: data.name,
          userName: data.userName,
          email: data.email
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Redirect to admin dashboard with userName
        router.push(`/admin/dashboard/${data.userName}`);
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
  };

  return (
    <AdminLoginForm
      email={email}
      password={password}
      error={error}
      handleEmailChange={(e) => setEmail(e.target.value)}
      handlePasswordChange={(e) => setPassword(e.target.value)}
      handleSubmit={handleSubmit}
    />
  );
};

export default AdminLoginPage;
