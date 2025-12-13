import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      setUser(storedUser);
    }

    // ✅ Update user if login redirected with state
    if (location.state?.loggedIn && location.state?.user) {
      setUser(location.state.user);
    }
  }, [location.state]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'user';

  const isActive = (path) => location.pathname === path;

  return (
    <div className="navbar bg-base-100 shadow-md px-4 sticky top-0 z-50">
      {/* LEFT */}
      <div className="navbar-start">
        {/* MOBILE MENU */}
        <div className="dropdown lg:hidden">
          <label tabIndex={0} className="btn btn-ghost btn-circle">
            ☰
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <Link className={isActive('/') ? 'active font-bold' : ''} to="/">
                Home
              </Link>
            </li>
            <li>
              <Link
                className={isActive('/books') ? 'active font-bold' : ''}
                to="/books"
              >
                Books
              </Link>
            </li>

            {isUser && (
              <li>
                <Link
                  className={isActive('/borrowed') ? 'active font-bold' : ''}
                  to="/borrowed"
                >
                  My Borrowed Books
                </Link>
              </li>
            )}

            {isAdmin && (
              <>
                <li>
                  <Link
                    className={
                      isActive('/admin/borrowed') ? 'active font-bold' : ''
                    }
                    to="/admin/borrowed"
                  >
                    Borrowed Books
                  </Link>
                </li>
                <li>
                  <Link
                    className={
                      isActive('/admin/return') ? 'active font-bold' : ''
                    }
                    to="/admin/return"
                  >
                    Return
                  </Link>
                </li>
                <li>
                  <Link
                    className={
                      isActive('/admin/dashboard') ? 'active font-bold' : ''
                    }
                    to="/admin/dashboard"
                  >
                    Dashboard
                  </Link>
                </li>
              </>
            )}

            {!user && (
              <>
                <li>
                  <Link
                    className={isActive('/login') ? 'active font-bold' : ''}
                    to="/login"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    className={isActive('/register') ? 'active font-bold' : ''}
                    to="/register"
                  >
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        <Link className="btn btn-ghost text-xl" to="/">
          Library System
        </Link>
      </div>

      {/* CENTER (DESKTOP) */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-2">
          <li>
            <Link className={isActive('/') ? 'active font-bold' : ''} to="/">
              Home
            </Link>
          </li>
          <li>
            <Link
              className={isActive('/books') ? 'active font-bold' : ''}
              to="/books"
            >
              Books
            </Link>
          </li>

          {isUser && (
            <li>
              <Link
                className={isActive('/borrowed') ? 'active font-bold' : ''}
                to="/borrowed"
              >
                My Borrowed Books
              </Link>
            </li>
          )}

          {isAdmin && (
            <>
              <li>
                <Link
                  className={
                    isActive('/admin/borrowed') ? 'active font-bold' : ''
                  }
                  to="/admin/borrowed"
                >
                  Borrowed Books
                </Link>
              </li>
              <li>
                <Link
                  className={
                    isActive('/admin/return') ? 'active font-bold' : ''
                  }
                  to="/admin/return"
                >
                  Return
                </Link>
              </li>
            </>
          )}

          {!user && (
            <>
              <li>
                <Link
                  className={isActive('/login') ? 'active font-bold' : ''}
                  to="/login"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  className={isActive('/register') ? 'active font-bold' : ''}
                  to="/register"
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* RIGHT */}
      <div className="navbar-end flex gap-3">
        <button className="btn btn-ghost" onClick={toggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {user && (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <img
                  src="/profile.png"
                  alt="profile"
                  className="object-cover w-10 h-10 rounded-full"
                />
              </div>
            </label>

            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-40"
            >
              {isAdmin && (
                <li>
                  <button onClick={() => navigate('/admin/dashboard')}>
                    Dashboard
                  </button>
                </li>
              )}
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
