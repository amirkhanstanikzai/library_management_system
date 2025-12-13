import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    description: { type: String, trim: true, required: true },

    // ✅ NEW: Category field
    category: { type: String, required: true, trim: true },

    image: { type: String },
    totalCopies: { type: Number, default: 1 },
    borrowedCopies: { type: Number, default: 0 },
    borrowers: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        borrowedAt: { type: Date, default: Date.now },
        returnRequested: { type: Boolean, default: false },
        returnedAt: { type: Date },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Book', bookSchema);
