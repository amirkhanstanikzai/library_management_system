import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null); // stores logged-in user info
  const [borrowedBooks, setBorrowedBooks] = useState([]);

  // Load user from localStorage and handle navigation state
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      setUser(storedUser);
      fetchBorrowedBooks(token);
    }

    // Handle redirect after login
    if (location.state?.loggedIn) {
      const u = JSON.parse(localStorage.getItem('user'));
      if (u) setUser(u);
    }
  }, [location.state]);

  const fetchBorrowedBooks = async (token) => {
    try {
      const res = await fetch(
        'http://localhost:5000/library/books/my/borrowed',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setBorrowedBooks(data);
    } catch (err) {
      console.error('Failed to fetch borrowed books', err);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setBorrowedBooks([]);
    navigate('/'); // redirect to home after logout
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="navbar bg-base-100 shadow-md px-4">
      {/* Left */}
      <div className="navbar-start">
        <Link className="btn btn-ghost text-xl" to="/">
          Library System
        </Link>
      </div>

      {/* Center */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-2">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/books">Books</Link>
          </li>

          {isAdmin && (
            <>
              <li>
                <Link to="/borrowed">Borrowed Books</Link>
              </li>
              <li>
                <Link to="/return">Return</Link>
              </li>
            </>
          )}

          {!user && (
            <>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Right */}
      <div className="navbar-end flex gap-3">
        {/* Theme toggle */}
        <button className="btn btn-ghost" onClick={toggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {/* Profile Dropdown */}
        {user && (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <img src="/profile.png" alt="profile" />
              </div>
            </label>

            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 p-4 shadow bg-base-100 rounded-box w-60"
            >
              <li className="menu-title">Borrowed Books</li>

              {borrowedBooks.length === 0 && (
                <li className="opacity-70 text-sm">No borrowed books</li>
              )}

              {borrowedBooks.map((b, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>{b.title}</span>
                  <span className="text-xs opacity-60">
                    {new Date(b.borrowedAt).toLocaleDateString()}
                  </span>
                </li>
              ))}

              <div className="divider my-1"></div>

              {/* Dashboard link based on role */}
              <li>
                <button
                  className="w-full text-left"
                  onClick={() =>
                    navigate(isAdmin ? 'admin/dashboard' : '/dashboard')
                  }
                >
                  Dashboard
                </button>
              </li>

              <li>
                <button onClick={handleLogout} className="w-full text-left">
                  Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
