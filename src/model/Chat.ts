import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IChat extends Document {
  participants: Types.ObjectId[];
  isGroup: boolean;
  groupName?: string;
  groupPhoto?: string;
  lastMessage?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage extends Document {
  chat: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  messageType: 'text' | 'image' | 'file';
  readBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema: Schema<IChat> = new Schema({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  }],
  isGroup: {
    type: Boolean,
    default: false
  },
  groupName: {
    type: String
  },
  groupPhoto: {
    type: String
  },
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: "Message"
  }
}, {
  timestamps: true
});

const MessageSchema: Schema<IMessage> = new Schema({
  chat: {
    type: Schema.Types.ObjectId,
    ref: "Chat",
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  content: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  readBy: [{
    type: Schema.Types.ObjectId,
    ref: "User"
  }]
}, {
  timestamps: true
});

// Indexes
ChatSchema.index({ participants: 1 });
ChatSchema.index({ updatedAt: -1 });
MessageSchema.index({ chat: 1, createdAt: -1 });

const Chat = (mongoose.models.Chat as Model<IChat>) || mongoose.model<IChat>("Chat", ChatSchema);
const Message = (mongoose.models.Message as Model<IMessage>) || mongoose.model<IMessage>("Message", MessageSchema);

export { Chat, Message };
export default Chat;