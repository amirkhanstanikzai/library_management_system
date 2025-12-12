import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sort, setSort] = useState('title-asc');

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
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(
          'http://localhost:5000/library/books',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
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
    <div className="min-h-screen p-4 md:p-10 flex gap-6 bg-base-100">
      {/* Sidebar */}
      <aside className="w-64 hidden md:block bg-base-200 p-5 rounded-lg sticky top-20 shadow">
        <h2 className="text-2xl font-bold mb-4">Filters</h2>
        <input
          type="text"
          placeholder="Search..."
          className="input input-bordered w-full mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <h3 className="font-semibold mb-2">Category</h3>
        <ul className="menu bg-base-200 rounded-box">
          {categories.map((cat) => (
            <li key={cat}>
              <a
                className={selectedCategory === cat ? 'active' : ''}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </a>
            </li>
          ))}
        </ul>
      </aside>

      {/* Books Grid */}
      <main className="flex-1">
        <h1 className="text-4xl font-bold mb-6">Books</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredBooks.length === 0 && (
            <p className="col-span-full text-lg opacity-70">No books found.</p>
          )}
          {filteredBooks.map((book) => {
            const available = book.totalCopies - book.borrowedCopies > 0;
            return (
              <div
                key={book._id}
                className="card bg-base-200 shadow-md hover:shadow-xl"
              >
                <figure className="px-5 pt-5">
                  <img
                    src={`http://localhost:5000/${book.image}`}
                    alt={book.title}
                    className="w-32 h-32 object-cover"
                  />
                </figure>
                <div className="card-body">
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
                    className={
                      available
                        ? 'text-green-500 font-semibold'
                        : 'text-red-500 font-semibold'
                    }
                  >
                    {available ? 'Available' : 'Not Available'}
                  </p>
                  <div className="card-actions justify-end">
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={!available}
                    >
                      Borrow
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
