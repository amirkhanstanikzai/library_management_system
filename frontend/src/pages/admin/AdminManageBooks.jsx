import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ManageBooks() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text: string }
  const [deleteBookId, setDeleteBookId] = useState(null); // Book to delete confirmation

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Unauthorized');

      const res = await axios.get('http://localhost:5000/library/books', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Map images to full backend URL if uploaded
      const updatedBooks = res.data.map((book) => ({
        ...book,
        image: book.image
          ? `http://localhost:5000/${book.image.replace(/\\/g, '/')}`
          : '/no-image.png',
      }));

      setBooks(updatedBooks);
    } catch (error) {
      console.error(error);
      setMessage({
        type: 'error',
        text: 'Failed to load books. Make sure you are logged in.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/library/books/${deleteBookId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage({ type: 'success', text: 'Book deleted successfully' });
      setDeleteBookId(null);
      fetchBooks();
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to delete book' });
      setDeleteBookId(null);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-base-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-4xl font-bold">📚 Manage Books</h1>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/admin/add-book')}
          >
            ➕ Add Book
          </button>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`p-4 mb-6 rounded ${
              message.type === 'success'
                ? 'bg-green-200 text-green-800'
                : 'bg-red-200 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="text-center text-xl py-10">Loading books...</div>
        ) : books.length === 0 ? (
          <div className="text-center text-lg py-10 opacity-70">
            No books found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full bg-base-100 shadow-md rounded-lg">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Book</th>
                  <th>Copies</th>
                  <th>Borrowed</th>
                  <th>Available</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book._id}>
                    <td>
                      <img
                        src={book.image}
                        alt={book.title}
                        className="w-16 h-20 object-cover rounded-md"
                      />
                    </td>
                    <td>
                      <div className="font-semibold">{book.title}</div>
                      <div className="text-sm opacity-60">{book.author}</div>
                    </td>
                    <td>{book.totalCopies}</td>
                    <td>{book.borrowedCopies}</td>
                    <td>{book.totalCopies - book.borrowedCopies}</td>
                    <td className="flex gap-2">
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => navigate(`/admin/edit-book/${book._id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-error"
                        onClick={() => setDeleteBookId(book._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Delete confirmation modal */}
        {deleteBookId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-base-100 p-6 rounded shadow-lg w-96 text-center">
              <p className="text-lg mb-4">
                Are you sure you want to delete this book?
              </p>
              <div className="flex justify-center gap-4">
                <button className="btn btn-error" onClick={confirmDelete}>
                  Yes, Delete
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => setDeleteBookId(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
