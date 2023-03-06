import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { resetToken } = useParams();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const response = await axios.post(`http://localhost:8080/user/reset-password/${resetToken}`, { newPassword });
      setMessage(response.data.message);
      setError('');
    } catch (error) {
      console.log(error);
      setMessage('');
      setError(error.response.data.error);
    }
  };

  return (
    <div>
      {JSON.stringify(message) && <div>{JSON.stringify(message)}</div>}
      {JSON.stringify(error) && <div>{JSON.stringify(error)}</div>}
      <form onSubmit={handleResetPassword}>
        <label>
          New Password:
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </label>
        <br />
        <label>
          Confirm Password:
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </label>
        <br />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
