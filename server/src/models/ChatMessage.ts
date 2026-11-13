import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  threadId: { type: String, required: true, maxlength: 80 },
  mode: { type: String, enum: ['tutor', 'voice'], required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true, maxlength: 8_000 },
}, { timestamps: true, versionKey: false });

chatMessageSchema.index({ projectId: 1, threadId: 1, createdAt: 1 });
export const ChatMessage = mongoose.models.ChatMessage ?? mongoose.model('ChatMessage', chatMessageSchema);
