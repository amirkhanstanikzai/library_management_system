import { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  // Pre-fill email if passed from register
  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data } = await axios.post(
        'http://localhost:5000/library/auth/verify-email',
        { email, code }
      );

      setMessage(data.message);

      // Redirect to login after 2s
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 px-4">
      <div className="w-full max-w-md bg-base-200 p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Verify Your Email
        </h2>

        {message && (
          <div className="mb-4 text-center text-sm text-red-500">{message}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="input input-bordered w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Verification Code"
            className="input input-bordered w-full"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <button
            type="submit"
            className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
}
