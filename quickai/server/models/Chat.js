import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  image: { type: String, default: null },
  tokens: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, default: 'New Chat' },
  persona: { type: String, default: 'default' },
  totalTokens: { type: Number, default: 0 },
  messages: [messageSchema]
}, { timestamps: true });

chatSchema.index({ userId: 1, updatedAt: -1 });
export default mongoose.model('Chat', chatSchema);
