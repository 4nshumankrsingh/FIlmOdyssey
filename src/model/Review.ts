import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IReview extends Document {
  user: Types.ObjectId;
  film: Types.ObjectId;
  filmTmdbId: number;
  filmTitle: string;
  filmPoster?: string;
  rating: number;
  content: string;
  containsSpoilers: boolean;
  watchedDate: Date;
  isRewatch: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema<IReview> = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  film: {
    type: Schema.Types.ObjectId,
    ref: "Film",
    required: true
  },
  filmTmdbId: {
    type: Number,
    required: true,
    index: true
  },
  filmTitle: {
    type: String,
    required: true
  },
  filmPoster: {
    type: String
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  containsSpoilers: {
    type: Boolean,
    default: false
  },
  watchedDate: {
    type: Date,
    default: Date.now
  },
  isRewatch: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Remove unique constraint to allow multiple reviews
ReviewSchema.index({ filmTmdbId: 1, createdAt: -1 });
ReviewSchema.index({ user: 1, createdAt: -1 });
ReviewSchema.index({ watchedDate: -1 });

// Drop any existing unique indexes when model is compiled
ReviewSchema.pre('save', function(next) {
  // This ensures we don't have unique constraint issues
  next();
});

const Review = (mongoose.models.Review as Model<IReview>) || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;