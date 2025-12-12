import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function EditBook() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    author: '',
    genre: '',
    totalCopies: 1,
    image: '',
    description: '',
  });

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ message: '', type: '' }); // type: success | error

  const backendURL = 'http://localhost:5000/'; // Backend base URL

  // Fetch book details
  const fetchBook = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${backendURL}library/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Prepend backend URL to image if it exists
      const bookData = res.data;
      if (bookData.image) {
        bookData.image = backendURL + bookData.image;
      }

      setForm(bookData);
    } catch (error) {
      console.error('Failed to load book:', error.response?.data || error);
      setStatus({ message: 'Failed to load book', type: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBook();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.name === 'totalCopies'
          ? Number(e.target.value)
          : e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: '', type: '' });

    try {
      const token = localStorage.getItem('token');

      await axios.put(`${backendURL}library/books/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStatus({ message: 'Book updated successfully!', type: 'success' });

      // Redirect to books after 1.5 seconds
      setTimeout(() => navigate('/admin/books'), 1500);
    } catch (error) {
      console.error('Update failed:', error.response?.data || error);
      setStatus({ message: 'Update failed. Try again.', type: 'error' });
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading book...
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="w-full max-w-3xl bg-base-100 p-8 shadow-xl rounded-md">
        <h1 className="text-4xl font-bold mb-6 text-center">✏️ Edit Book</h1>

        {status.message && (
          <div
            className={`mb-4 p-3 rounded ${
              status.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-semibold">Title *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          <div>
            <label className="font-semibold">Author *</label>
            <input
              type="text"
              name="author"
              value={form.author}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          <div>
            <label className="font-semibold">Genre</label>
            <input
              type="text"
              name="genre"
              value={form.genre}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label className="font-semibold">Total Copies *</label>
            <input
              type="number"
              name="totalCopies"
              value={form.totalCopies}
              onChange={handleChange}
              min="1"
              className="input input-bordered w-full"
              required
            />
          </div>

          <div>
            <label className="font-semibold">Image URL</label>
            <input
              type="text"
              name="image"
              value={form.image}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
            {form.image && (
              <img
                src={form.image}
                alt="book"
                className="w-32 mt-2 rounded-md shadow"
              />
            )}
          </div>

          <div>
            <label className="font-semibold">Description</label>
            <textarea
              name="description"
              rows="4"
              value={form.description}
              onChange={handleChange}
              className="textarea textarea-bordered w-full"
            />
          </div>

          <button className="btn btn-primary w-full text-lg">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
