import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    description: { type: String, trim: true, required: true},
    image: { type: String },
    totalCopies: { type: Number, default: 1 }, // total copies available
    borrowedCopies: { type: Number, default: 0 }, // number currently borrowed
    borrowers: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        borrowedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Book', bookSchema);
