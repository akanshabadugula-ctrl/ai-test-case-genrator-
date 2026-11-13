import mongoose from 'mongoose';

const generationSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  generationType: { type: String, enum: ['unit', 'integration', 'api', 'edge', 'validation'], required: true },
  goal: { type: String, required: true, maxlength: 500 },
  sourceCode: { type: String, required: true, maxlength: 20_000 },
  generatedContent: { type: String, required: true, maxlength: 40_000 },
  qualityScore: { type: Number, min: 0, max: 100, default: null },
}, { timestamps: true, versionKey: false });

generationSchema.index({ projectId: 1, createdAt: -1 });
export const Generation = mongoose.models.Generation ?? mongoose.model('Generation', generationSchema);
