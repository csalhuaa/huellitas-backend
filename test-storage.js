// test-storage.js
require('dotenv').config();
const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const bucket = storage.bucket(process.env.GCP_BUCKET_NAME);

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a Cloud Storage...');
    
    const [exists] = await bucket.exists();
    
    if (exists) {
      console.log('✅ Bucket encontrado:', process.env.GCP_BUCKET_NAME);
      
      // Intentar listar archivos
      const [files] = await bucket.getFiles();
      console.log(`📁 Archivos en el bucket: ${files.length}`);
      
      console.log('✅ Conexión exitosa!');
    } else {
      console.error('❌ Bucket no encontrado');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testConnection();
