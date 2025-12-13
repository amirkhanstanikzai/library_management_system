import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post(
        'http://localhost:5000/library/auth/register',
        { name, email, password }
      );

      // Redirect to VerifyEmail page with email pre-filled
      navigate('/verify-email', { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 px-4 sm:px-6 md:px-10 lg:px-20">
      <div className="w-full max-w-md sm:max-w-lg bg-base-200 p-6 sm:p-8 md:p-10 rounded-lg shadow">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Register</h2>

        {error && (
          <div className="mb-4 text-center text-sm sm:text-base text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            className="input input-bordered w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="input input-bordered w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="input input-bordered w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
