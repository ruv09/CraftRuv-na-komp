import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['cabinet', 'kitchen', 'table', 'chair', 'bed', 'shelf', 'custom'],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'in_progress', 'completed', 'archived'],
    default: 'draft'
  },
  dimensions: {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    depth: { type: Number, required: true },
    unit: { type: String, enum: ['mm', 'cm', 'm'], default: 'mm' }
  },
  materials: [{
    name: { type: String, required: true },
    type: { type: String, enum: ['wood', 'metal', 'plastic', 'glass', 'fabric'], required: true },
    thickness: { type: Number },
    color: { type: String },
    quantity: { type: Number, required: true },
    unit: { type: String, enum: ['m2', 'm', 'pcs'], required: true },
    cost: { type: Number }
  }],
  components: [{
    name: { type: String, required: true },
    type: { type: String, enum: ['panel', 'shelf', 'door', 'drawer', 'handle', 'hinge'], required: true },
    dimensions: {
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      depth: { type: Number, required: true }
    },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 }
    },
    material: { type: String },
    color: { type: String },
    quantity: { type: Number, default: 1 }
  }],
  settings: {
    joinery: { type: String, enum: ['dovetail', 'dado', 'pocket', 'butt'], default: 'pocket' },
    finish: { type: String, enum: ['none', 'varnish', 'paint', 'stain'], default: 'none' },
    hardware: { type: Boolean, default: true }
  },
  files: {
    model3d: { type: String }, // URL to 3D model file
    drawings: [{ type: String }], // URLs to drawing files
    renderings: [{ type: String }] // URLs to rendering images
  },
  metadata: {
    totalCost: { type: Number, default: 0 },
    estimatedTime: { type: Number, default: 0 }, // in hours
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    tags: [{ type: String }]
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Index for better query performance
projectSchema.index({ user: 1, createdAt: -1 });
projectSchema.index({ type: 1, status: 1 });
projectSchema.index({ isPublic: 1, views: -1 });

// Virtual for like count
projectSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Ensure virtual fields are serialized
projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

export default mongoose.model('Project', projectSchema); 