import mongoose, { type InferSchemaType } from 'mongoose';

const projectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  projectName: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  repositoryUrl: { type: String, trim: true, maxlength: 2048, default: '' },
  repositorySummary: { type: String, default: '' },
  detectedTechnologies: { type: [String], default: [] },
}, { timestamps: true, versionKey: false });

projectSchema.index({ userId: 1, updatedAt: -1 });

export type ProjectDocument = InferSchemaType<typeof projectSchema> & mongoose.Document;
export const Project = mongoose.models.Project ?? mongoose.model('Project', projectSchema);
