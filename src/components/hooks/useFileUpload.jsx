import { useState } from 'react';
import { FileService } from '../services/fileService';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);

  const uploadFiles = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const results = await FileService.uploadFiles(Array.from(files));
      
      const successfulUploads = results
        .filter(result => result.success)
        .map(result => result.document);
      
      if (successfulUploads.length > 0) {
        setDocuments(prev => [...prev, ...successfulUploads]);
      }

      return results;
    } catch (error) {
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const clearDocuments = () => {
    setDocuments([]);
  };

  return {
    uploading,
    documents,
    uploadFiles,
    removeDocument,
    clearDocuments,
    setDocuments
  };
};