import mongoose from 'mongoose';

// This ensures models are loaded only once
let modelsLoaded = false;

export const loadModels = () => {
  if (modelsLoaded) return;
  
  console.log('🔧 Loading Mongoose models...');
  
  // Import all models to ensure they're registered
  require('@/model/User');
  require('@/model/Film'); 
  require('@/model/Review');
  
  console.log('✅ All models loaded');
  modelsLoaded = true;
};