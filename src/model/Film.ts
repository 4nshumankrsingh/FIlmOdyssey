import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IFilm extends Document {
  tmdbId: number;
  title: string;
  overview: string;
  releaseDate: Date;
  genres: number[];
  posterPath?: string;
  backdropPath?: string;
  popularity: number;
  voteAverage: number;
  voteCount: number;
  runtime?: number;
  tagline?: string;
  status: string;
  watchedBy: Types.ObjectId[];
  watchlistedBy: Types.ObjectId[];
  likedBy: Types.ObjectId[];
  reviews: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const FilmSchema: Schema<IFilm> = new Schema({
  tmdbId: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  overview: {
    type: String,
    default: ""
  },
  releaseDate: {
    type: Date,
    required: true
  },
  genres: [{
    type: Number,
    required: true
  }],
  posterPath: {
    type: String
  },
  backdropPath: {
    type: String
  },
  popularity: {
    type: Number,
    default: 0
  },
  voteAverage: {
    type: Number,
    default: 0
  },
  voteCount: {
    type: Number,
    default: 0
  },
  runtime: {
    type: Number
  },
  tagline: {
    type: String
  },
  status: {
    type: String,
    default: "Released"
  },
  watchedBy: [{
    type: Schema.Types.ObjectId,
    ref: "User"
  }],
  watchlistedBy: [{
    type: Schema.Types.ObjectId,
    ref: "User"
  }],
  likedBy: [{
    type: Schema.Types.ObjectId,
    ref: "User"
  }],
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: "Review"
  }]
}, {
  timestamps: true
});

// Static methods
FilmSchema.statics.findByTmdbId = async function(tmdbId: number): Promise<IFilm | null> {
  return this.findOne({ tmdbId });
};

FilmSchema.statics.findByTitle = async function(title: string): Promise<IFilm[]> {
  return this.find({ 
    title: { $regex: title, $options: 'i' } 
  });
};

// Indexes
FilmSchema.index({ title: 'text', overview: 'text' });
FilmSchema.index({ releaseDate: -1 });
FilmSchema.index({ popularity: -1 });
FilmSchema.index({ voteAverage: -1 });
FilmSchema.index({ watchedBy: 1 });
FilmSchema.index({ watchlistedBy: 1 });
FilmSchema.index({ likedBy: 1 });

// FIX: Use a simple, reliable model registration
const Film = mongoose.models.Film || mongoose.model<IFilm>("Film", FilmSchema);

export default Film;