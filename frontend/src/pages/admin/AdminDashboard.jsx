import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen p-10 bg-base-200">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Manage Books */}
        <Link
          to="/admin/books"
          className="card bg-base-100 p-6 shadow hover:shadow-xl"
        >
          <h2 className="text-2xl font-bold">📚 Manage Books</h2>
          <p className="opacity-70 mt-2">View, edit, or delete all books</p>
        </Link>

        {/* Add Book */}
        <Link
          to="/admin/add-book"
          className="card bg-base-100 p-6 shadow hover:shadow-xl"
        >
          <h2 className="text-2xl font-bold">➕ Add New Book</h2>
          <p className="opacity-70 mt-2">Create a new book entry</p>
        </Link>

        {/* Borrowed Books */}
        <Link
          to="/admin/borrowed"
          className="card bg-base-100 p-6 shadow hover:shadow-xl"
        >
          <h2 className="text-2xl font-bold">👥 Borrowed Books</h2>
          <p className="opacity-70 mt-2">See who borrowed which book</p>
        </Link>

        {/* Return Requests */}
        <Link
          to="/admin/returns"
          className="card bg-base-100 p-6 shadow hover:shadow-xl"
        >
          <h2 className="text-2xl font-bold">✔ Return Books</h2>
          <p className="opacity-70 mt-2">Manage book returns</p>
        </Link>
      </div>
    </div>
  );
}
