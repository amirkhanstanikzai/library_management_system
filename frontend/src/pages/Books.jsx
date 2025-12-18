import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import socket from '../socket'; // ✅ import your existing socket instance

export default function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sort, setSort] = useState('title-asc');
  const [categories, setCategories] = useState(['All']);

  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage, setBooksPerPage] = useState(10);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const updateBooksPerPage = () => {
      setBooksPerPage(window.innerWidth < 768 ? 5 : 10);
    };
    updateBooksPerPage();
    window.addEventListener('resize', updateBooksPerPage);
    return () => window.removeEventListener('resize', updateBooksPerPage);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    if (categoryParam) setSelectedCategory(categoryParam);
  }, [location.search]);

  // Fetch books and categories
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const url = token
          ? 'http://localhost:5000/library/books'
          : 'http://localhost:5000/library/books/public';
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};

        const { data } = await axios.get(url, config);
        setBooks(data);

        const uniqueCategories = [
          'All',
          ...new Set(data.map((b) => b.category).filter(Boolean)),
        ];
        setCategories(uniqueCategories);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // ✅ Socket.IO real-time updates
  useEffect(() => {
    const handleBookBorrowed = (update) => {
      setBooks((prev) =>
        prev.map((b) =>
          b._id === update.bookId
            ? { ...b, borrowedCopies: update.borrowedCopies }
            : b
        )
      );
    };

    const handleBookReturned = (update) => {
      setBooks((prev) =>
        prev.map((b) =>
          b._id === update.bookId
            ? { ...b, borrowedCopies: update.borrowedCopies }
            : b
        )
      );
    };

    socket.on('bookBorrowed', handleBookBorrowed);
    socket.on('bookReturned', handleBookReturned);

    return () => {
      socket.off('bookBorrowed', handleBookBorrowed);
      socket.off('bookReturned', handleBookReturned);
    };
  }, []);

  const filteredBooks = books
    .filter((b) =>
      selectedCategory === 'All' ? true : b.category === selectedCategory
    )
    .filter((b) =>
      search === ''
        ? true
        : b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.author.toLowerCase().includes(search.toLowerCase()) ||
          (b.category &&
            b.category.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sort === 'title-asc') return a.title.localeCompare(b.title);
      if (sort === 'title-desc') return b.title.localeCompare(a.title);
      if (sort === 'available') {
        const aAvail = a.totalCopies - a.borrowedCopies;
        const bAvail = b.totalCopies - b.borrowedCopies;
        return bAvail - aAvail;
      }
      return 0;
    });

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading books...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex justify-center items-center text-red-500">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen p-4 md:p-10 flex flex-col md:flex-row gap-6 bg-base-100">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-base-200 p-5 rounded-lg md:sticky md:top-20 shadow">
        <h2 className="text-2xl font-bold mb-4">Filters</h2>

        <input
          type="text"
          placeholder="Search..."
          className="input input-bordered w-full mb-4"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />

        <h3 className="font-semibold mb-2">Category</h3>
        <ul className="menu bg-base-200 rounded-box flex flex-wrap md:flex-col gap-1">
          {categories.map((cat) => (
            <li key={cat}>
              <a
                className={`cursor-pointer ${
                  selectedCategory === cat ? 'active' : ''
                }`}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
              >
                {cat}
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-4">
          <h3 className="font-semibold mb-2">Sort By</h3>
          <select
            className="select select-bordered w-full"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
            <option value="available">Availability</option>
          </select>
        </div>
      </aside>

      {/* Books Grid */}
      <main className="flex-1">
        <h1 className="text-4xl font-bold mb-6 text-center md:text-left">
          Books
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentBooks.length === 0 && (
            <p className="col-span-full text-lg opacity-70 text-center">
              No books found.
            </p>
          )}

          {currentBooks.map((book) => {
            const available = book.totalCopies - book.borrowedCopies > 0;
            return (
              <div
                key={book._id}
                className="card bg-base-200 shadow-md hover:shadow-xl cursor-pointer transition flex flex-col"
                onClick={() => navigate(`/book/detail/${book._id}`)}
              >
                <figure className="px-5 pt-5 flex justify-center">
                  <img
                    src={
                      book.image
                        ? `http://localhost:5000/${book.image}`
                        : '/no-image.png'
                    }
                    alt={book.title}
                    className="w-32 h-32 sm:w-36 sm:h-36 object-cover"
                  />
                </figure>

                <div className="card-body flex-1 flex flex-col justify-between items-center text-center">
                  <h2 className="card-title">{book.title}</h2>
                  <p className="opacity-70">{book.author}</p>
                  <p className="badge badge-primary">{book.category}</p>
                  <p className="font-semibold">
                    Copies:{' '}
                    <span className="text-blue-500">
                      {book.totalCopies - book.borrowedCopies}/
                      {book.totalCopies}
                    </span>
                  </p>
                  <p
                    className={`font-semibold ${
                      available ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {available ? 'Available' : 'Not Available'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2 flex-wrap">
            {Array.from({ length: totalPages }, (_, idx) => (
              <button
                key={idx + 1}
                className={`btn btn-sm ${
                  currentPage === idx + 1 ? 'btn-primary' : 'btn-outline'
                }`}
                onClick={() => setCurrentPage(idx + 1)}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
