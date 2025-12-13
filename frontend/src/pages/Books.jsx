import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sort, setSort] = useState('title-asc');

  const navigate = useNavigate();

  const categories = [
    'All',
    'Fiction',
    'Programming',
    'Business',
    'History',
    'Self-Help',
    'Science',
  ];

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');

        // Use public route if not logged in
        const url = token
          ? 'http://localhost:5000/library/books'
          : 'http://localhost:5000/library/books/public';

        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};

        const { data } = await axios.get(url, config);
        setBooks(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const filteredBooks = books
    .filter((b) =>
      selectedCategory === 'All' ? true : b.category === selectedCategory
    )
    .filter((b) =>
      search === ''
        ? true
        : b.title.toLowerCase().includes(search.toLowerCase())
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
      {/* Sidebar for md+ screens */}
      <aside className="w-full md:w-64 bg-base-200 p-5 rounded-lg md:sticky md:top-20 shadow">
        <h2 className="text-2xl font-bold mb-4">Filters</h2>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search..."
          className="input input-bordered w-full mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Category Filter */}
        <h3 className="font-semibold mb-2">Category</h3>
        <ul className="menu bg-base-200 rounded-box flex flex-wrap md:flex-col gap-1">
          {categories.map((cat) => (
            <li key={cat}>
              <a
                className={`cursor-pointer ${
                  selectedCategory === cat ? 'active' : ''
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </a>
            </li>
          ))}
        </ul>

        {/* Sort Options (responsive) */}
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
        <h1 className="text-4xl font-bold mb-6 text-center md:text-left">Books</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.length === 0 && (
            <p className="col-span-full text-lg opacity-70 text-center">
              No books found.
            </p>
          )}

          {filteredBooks.map((book) => {
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
                      {book.totalCopies - book.borrowedCopies}/{book.totalCopies}
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
      </main>
    </div>
  );
}
