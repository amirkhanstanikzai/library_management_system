import { render, screen } from '@testing-library/react';
import BookCard from '../src/components/BookCard.jsx';

describe('BookCard Component', () => {
  test('renders book title and author', () => {
    render(<BookCard title="Test Book" author="John Doe" />);

    expect(screen.getByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByTestId('book-card')).toBeInTheDocument();
  });
});
