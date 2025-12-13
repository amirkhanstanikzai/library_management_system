import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AddBook() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [totalCopies, setTotalCopies] = useState(1);
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState(''); // ✅ Added category

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !author || !description || !category) {
      // ✅ include category validation
      setMessage({ type: 'error', text: 'Please fill all required fields.' });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ type: 'error', text: 'Unauthorized. Please login again.' });
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('description', description);
    formData.append('totalCopies', totalCopies);
    formData.append('category', category); // ✅ append category
    if (image) formData.append('image', image);

    try {
      setLoading(true);
      await axios.post('http://localhost:5000/library/books', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage({ type: 'success', text: 'Book added successfully!' });
      setTimeout(() => navigate('/admin/books'), 1500);
    } catch (error) {
      const errMsg =
        error.response?.data?.message || 'Failed to add book. Try again.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-3 sm:px-6 md:px-10 py-8 sm:py-10">
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-center">
          ➕ Add New Book
        </h1>

        {message.text && (
          <div
            className={`mb-4 p-3 rounded text-sm sm:text-base ${
              message.type === 'success'
                ? 'bg-green-200 text-green-800'
                : 'bg-red-200 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="card bg-base-100 shadow-xl p-4 sm:p-6 md:p-8 space-y-4"
        >
          <div className="form-control w-full">
            <label className="label font-semibold">Title *</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label font-semibold">Author *</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label font-semibold">Description *</label>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="form-control w-full">
            <label className="label font-semibold">Total Copies *</label>
            <input
              type="number"
              className="input input-bordered w-full"
              min="1"
              value={totalCopies}
              onChange={(e) => setTotalCopies(e.target.value)}
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label font-semibold">Category *</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label font-semibold">Book Image (optional)</label>
            <input
              type="file"
              className="file-input file-input-bordered w-full"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </div>

          <button
            className="btn btn-primary w-full text-sm sm:text-base mt-4"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Book'}
          </button>
        </form>
      </div>
    </div>
  );
}
