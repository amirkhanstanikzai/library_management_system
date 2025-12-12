import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  // ⭐ Dynamic Featured Books (mock now — API later)
  const [featuredBooks, setFeaturedBooks] = useState([]);

  useEffect(() => {
    // Simulating API fetch
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

  // ⭐ Categories
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

  // ⭐ Search Handling
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = () => {
    if (searchInput.trim() !== '') {
      navigate(`/books?search=${searchInput}`);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 px-4 lg:px-20 py-10">
      {/* HERO SECTION */}
      <section className="flex flex-col lg:flex-row items-center justify-between mt-10">
        {/* Text */}
        <div className="max-w-xl space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Discover, Learn & Explore
            <span className="text-primary block">Your Digital Library</span>
          </h1>

          <p className="text-lg opacity-80">
            Borrow books, explore categories, and grow your knowledge in our
            modern, easy-to-use Library System.
          </p>

          <div className="flex gap-3 mt-4">
            <Link to="/books" className="btn btn-primary">
              Browse Books
            </Link>

            <Link to="/login" className="btn btn-outline">
              Login
            </Link>
          </div>
        </div>

        {/* Image */}
        <div className="mt-10 lg:mt-0">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png"
            alt="Library Illustration"
            className="w-72 md:w-96"
          />
        </div>
      </section>

      {/* SEARCH BAR */}
      <section className="mt-16 flex justify-center">
        <div className="form-control w-full max-w-lg flex-row gap-3">
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
        <h2 className="text-3xl font-bold mb-6">Categories</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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

      {/* FEATURED BOOKS */}
      <section className="mt-20">
        <h2 className="text-3xl font-bold mb-6">Featured Books</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {featuredBooks.map((book) => (
            <div
              key={book.id}
              className="card bg-base-200 shadow hover:shadow-xl cursor-pointer"
              onClick={() => navigate(`/books/${book.id}`)}
            >
              <figure>
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-32 h-32 mt-5"
                />
              </figure>

              <div className="card-body">
                <h3 className="card-title">{book.title}</h3>
                <p className="opacity-70">{book.desc}</p>

                <div className="card-actions justify-end">
                  <button className="btn btn-primary btn-sm">Borrow</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="mt-24 text-center">
        <h2 className="text-3xl font-bold">Join Our Library Community</h2>
        <p className="opacity-75 mt-3">
          Create an account to start borrowing books easily.
        </p>

        <Link to="/register" className="btn btn-primary mt-5">
          Register Now
        </Link>
      </section>
    </div>
  );
}
