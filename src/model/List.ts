import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IList extends Document {
  _id: Types.ObjectId;
  title: string;
  user: Types.ObjectId;
  films: number[]; // Store TMDB IDs as numbers
  createdAt: Date;
  updatedAt: Date;
}

const ListSchema: Schema<IList> = new Schema({
  title: {
    type: String,
    required: [true, "List title is required"],
    trim: true,
    maxlength: [100, "List title cannot exceed 100 characters"]
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User is required"]
  },
  films: [{
    type: Number,
    required: false // Make it optional to avoid validation issues
  }]
}, {
  timestamps: true
});

// Indexes
ListSchema.index({ user: 1, createdAt: -1 });

// Clear any existing model to avoid conflicts
if (mongoose.models.List) {
  delete mongoose.models.List;
}

const List = mongoose.model<IList>("List", ListSchema);
export default List;