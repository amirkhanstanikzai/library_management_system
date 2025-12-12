import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Books from './pages/Books';
import Register from './pages/Register';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import AdminDashboard from './pages/admin/AdminDashboard';
import AddBook from './pages/admin/AddBook';
import AdminManageBooks from './pages/admin/AdminManageBooks';
import AdminBorrowedBooks from './pages/admin/AdminBorrowedBooks';
import AdminReturnBook from './pages/admin/AdminReturnBook';
import AdminEditBook from './pages/admin/AdminEditBook';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/books" element={<Books />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/add-book" element={<AddBook />} />
        <Route path="/admin/books" element={<AdminManageBooks />} />
        <Route path="/admin/borrowed" element={<AdminBorrowedBooks />} />
        <Route path="/admin/return" element={<AdminReturnBook />} />
        <Route path="/admin/edit-book/:id" element={<AdminEditBook />} />
      </Routes>
    </Router>
  );
}

export default App;
