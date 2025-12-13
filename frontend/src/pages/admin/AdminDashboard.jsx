import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-10 bg-base-200">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-center sm:text-left">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Manage Books */}
        <Link
          to="/admin/books"
          className="card bg-base-100 p-4 sm:p-6 shadow hover:shadow-xl transition"
        >
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
            📚 Manage Books
          </h2>
          <p className="opacity-70 mt-2 text-sm sm:text-base">
            View, edit, or delete all books
          </p>
        </Link>

        {/* Add Book */}
        <Link
          to="/admin/add-book"
          className="card bg-base-100 p-4 sm:p-6 shadow hover:shadow-xl transition"
        >
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
            ➕ Add New Book
          </h2>
          <p className="opacity-70 mt-2 text-sm sm:text-base">
            Create a new book entry
          </p>
        </Link>

        {/* Borrowed Books */}
        <Link
          to="/admin/borrowed"
          className="card bg-base-100 p-4 sm:p-6 shadow hover:shadow-xl transition"
        >
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
            👥 Borrowed Books
          </h2>
          <p className="opacity-70 mt-2 text-sm sm:text-base">
            See who borrowed which book
          </p>
        </Link>

        {/* Return Requests */}
        <Link
          to="/admin/return"
          className="card bg-base-100 p-4 sm:p-6 shadow hover:shadow-xl transition"
        >
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
            ✔ Return Books
          </h2>
          <p className="opacity-70 mt-2 text-sm sm:text-base">
            Manage book returns
          </p>
        </Link>
      </div>
    </div>
  );
}
