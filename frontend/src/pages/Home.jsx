import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [searchInput, setSearchInput] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    setFeaturedBooks([
      {
        id: 1,
        title: 'Atomic Habits',
        image: 'https://cdn-icons-png.flaticon.com/512/29/29302.png',
        desc: 'Build better habits and transform your life.',
      },
      {
        id: 2,
        title: 'Clean Code',
        image: 'https://cdn-icons-png.flaticon.com/512/29/29302.png',
        desc: 'A handbook of agile software craftsmanship.',
      },
      {
        id: 3,
        title: 'The Alchemist',
        image: 'https://cdn-icons-png.flaticon.com/512/29/29302.png',
        desc: 'A magical story about pursuing your dreams.',
      },
      {
        id: 4,
        title: 'Rich Dad Poor Dad',
        image: 'https://cdn-icons-png.flaticon.com/512/29/29302.png',
        desc: 'Personal finance and wealth mindset.',
      },
    ]);
  }, []);

  const categories = [
    'Science',
    'Technology',
    'History',
    'Programming',
    'Business',
    'Fiction',
    'Self-Help',
    'Others',
  ];

  const handleSearch = () => {
    if (searchInput.trim()) {
      navigate(`/books?search=${searchInput}`);
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
      <section className="mt-16 flex justify-center">
        <div className="form-control w-full max-w-lg flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search books, authors, categories..."
            className="input input-bordered w-full shadow-md"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleSearch}>
            Search
          </button>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mt-20">
        <h2 className="text-3xl font-bold mb-6 text-center lg:text-left">
          Categories
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/books?category=${cat}`)}
              className="card bg-base-200 shadow hover:shadow-lg cursor-pointer transition"
            >
              <div className="card-body items-center text-center">
                <h3 className="text-lg font-semibold">{cat}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="mt-20">
        <h2 className="text-3xl font-bold mb-6 text-center lg:text-left">
          Featured Books
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {featuredBooks.map((book) => (
            <div
              key={book.id}
              className="card bg-base-200 shadow hover:shadow-xl cursor-pointer flex flex-col"
            >
              <figure className="flex justify-center mt-5">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-24 sm:w-32 h-24 sm:h-32 object-contain"
                />
              </figure>

              <div className="card-body text-center flex flex-col justify-between">
                <h3 className="card-title justify-center">{book.title}</h3>
                <p className="opacity-70">{book.desc}</p>
                <div className="card-actions justify-center mt-2">
                  <button className="btn btn-primary btn-sm">Borrow</button>
                </div>
              </div>
            </div>
          ))}
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
