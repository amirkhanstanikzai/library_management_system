import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Home() {
  const navigate = useNavigate();

  const [featuredBooks, setFeaturedBooks] = useState([]); // ✅ new books
  const [categories, setCategories] = useState([]); // ✅ dynamic categories
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]); // ✅ search suggestions
  const [loadingBorrow, setLoadingBorrow] = useState(false);
  const [borrowStatus, setBorrowStatus] = useState({}); // { [bookId]: message }

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchNewBooks(); // fetch recent books dynamically
    fetchCategories(); // fetch categories dynamically
  }, []);

  // Fetch recent books dynamically
  const fetchNewBooks = async () => {
    try {
      const url = token
        ? 'http://localhost:5000/library/books'
        : 'http://localhost:5000/library/books/public';

      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      const { data } = await axios.get(url, config);

      // Sort by recently added and take top 4
      const recentBooks = data
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4);

      setFeaturedBooks(recentBooks);
    } catch (err) {
      console.error('Failed to load new books:', err);
    }
  };

  // Fetch distinct categories from books dynamically
  const fetchCategories = async () => {
    try {
      const url = token
        ? 'http://localhost:5000/library/books'
        : 'http://localhost:5000/library/books/public';

      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      const { data } = await axios.get(url, config);

      // Extract unique categories from books
      const uniqueCategories = [
        ...new Set(data.map((book) => book.category).filter(Boolean)),
      ];

      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  // Handle search input change
  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchInput(value);

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const url = token
        ? 'http://localhost:5000/library/books'
        : 'http://localhost:5000/library/books/public';
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};
      const { data } = await axios.get(url, config);

      // Filter by title, author, or category
      const filtered = data.filter(
        (book) =>
          book.title.toLowerCase().includes(value.toLowerCase()) ||
          book.author?.toLowerCase().includes(value.toLowerCase()) ||
          book.category?.toLowerCase().includes(value.toLowerCase())
      );

      setSearchResults(filtered.slice(0, 5)); // show top 5 suggestions
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  // When clicking a suggestion, navigate to Books.jsx with category
  const handleSuggestionClick = (book) => {
    navigate(`/books?search=${book.title}&category=${book.category}`);
  };

  const handleSearchButton = () => {
    if (searchInput.trim()) {
      navigate(`/books?search=${searchInput}`);
    }
  };

  // Borrow a book
  const handleBorrow = async (bookId) => {
    if (!token) {
      setBorrowStatus((prev) => ({
        ...prev,
        [bookId]: 'Please login to borrow books.',
      }));
      navigate('/login');
      return;
    }

    try {
      setLoadingBorrow(true);
      setBorrowStatus((prev) => ({ ...prev, [bookId]: '' }));

      await axios.post(
        `http://localhost:5000/library/books/${bookId}/borrow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBorrowStatus((prev) => ({
        ...prev,
        [bookId]: 'You have successfully borrowed this book.',
      }));

      setFeaturedBooks((prevBooks) =>
        prevBooks.map((b) =>
          b._id === bookId
            ? { ...b, borrowedCopies: (b.borrowedCopies || 0) + 1 }
            : b
        )
      );
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Unable to borrow this book at the moment.';
      setBorrowStatus((prev) => ({ ...prev, [bookId]: msg }));
    } finally {
      setLoadingBorrow(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 px-4 sm:px-8 lg:px-20 py-10">
      {/* HERO */}
      <section className="flex flex-col-reverse lg:flex-row items-center justify-between gap-10 mt-10">
        <div className="max-w-xl space-y-6 text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
            Discover, Learn & Explore
            <span className="text-primary block">Your Digital Library</span>
          </h1>

          <p className="text-lg opacity-80">
            Borrow books, explore categories, and grow your knowledge in our
            modern Library System.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <Link to="/books" className="btn btn-primary">
              Browse Books
            </Link>

            {!token && (
              <Link to="/login" className="btn btn-outline">
                Login
              </Link>
            )}

            {!token && (
              <Link to="/register" className="btn btn-outline">
                Register
              </Link>
            )}
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <img
            src="library.png"
            alt="Library Illustration"
            className="w-48 sm:w-56 md:w-72 lg:w-96"
          />
        </div>
      </section>

      {/* SEARCH */}
      <section className="mt-16 flex justify-center relative">
        <div className="form-control w-full max-w-lg flex flex-col sm:flex-row gap-3 relative">
          <input
            type="text"
            placeholder="Search books, authors, categories..."
            className="input input-bordered w-full shadow-md"
            value={searchInput}
            onChange={handleSearchChange}
          />

          {/* Dropdown Suggestions */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 w-full bg-base-200 shadow-md mt-1 z-50 rounded-md overflow-hidden">
              {searchResults.map((book) => (
                <div
                  key={book._id}
                  className="p-2 hover:bg-base-300 cursor-pointer"
                  onClick={() => handleSuggestionClick(book)}
                >
                  <p className="font-semibold">{book.title}</p>
                  <p className="text-sm opacity-70">{book.author}</p>
                  <p className="text-sm badge badge-primary">{book.category}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mt-20">
        <h2 className="text-3xl font-bold mb-6 text-center lg:text-left">
          Categories
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {categories.length > 0 ? (
            categories.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => navigate(`/books?category=${cat}`)}
                className="card bg-base-200 shadow hover:shadow-lg cursor-pointer transition"
              >
                <div className="card-body items-center text-center">
                  <h3 className="text-lg font-semibold">{cat}</h3>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center opacity-70">
              No categories available
            </p>
          )}
        </div>
      </section>

      {/* NEW BOOKS */}
      <section className="mt-20">
        <h2 className="text-3xl font-bold mb-6 text-center lg:text-left">
          New Books
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {featuredBooks.map((book) => {
            const available = book.totalCopies - (book.borrowedCopies || 0) > 0;
            return (
              <div
                key={book._id}
                className="card bg-base-200 shadow hover:shadow-xl cursor-pointer flex flex-col"
                onClick={() => navigate(`/book/detail/${book._id}`)}
              >
                <figure className="flex justify-center mt-5">
                  <img
                    src={
                      book.image
                        ? `http://localhost:5000/${book.image}`
                        : '/no-image.png'
                    }
                    alt={book.title}
                    className="w-24 sm:w-32 h-24 sm:h-32 object-contain"
                  />
                </figure>

                <div className="card-body text-center flex flex-col justify-between">
                  <h3 className="card-title justify-center">{book.title}</h3>
                  <p className="opacity-70">{book.author}</p>
                  <p
                    className={`font-semibold ${
                      available ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {available ? 'Available' : 'Not Available'}
                  </p>

                  {borrowStatus[book._id] && (
                    <p
                      className={`text-sm mt-1 ${
                        borrowStatus[book._id].includes('successfully')
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {borrowStatus[book._id]}
                    </p>
                  )}

                  <div className="card-actions justify-center mt-2">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation(); // prevent navigating to detail
                        handleBorrow(book._id);
                      }}
                      disabled={!available || loadingBorrow}
                    >
                      {loadingBorrow ? 'Processing...' : 'Borrow'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      {!token && (
        <section className="mt-24 text-center px-4 sm:px-0">
          <h2 className="text-3xl font-bold">Join Our Library Community</h2>
          <p className="opacity-75 mt-3">
            Create an account to start borrowing books easily.
          </p>

          <Link to="/register" className="btn btn-primary mt-5">
            Register Now
          </Link>
        </section>
      )}
    </div>
  );
}
