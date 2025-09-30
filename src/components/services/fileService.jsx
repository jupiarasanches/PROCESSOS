import { UploadFile } from "@/api/integrations";
import { validateFile } from "../utils/validators";

export class FileService {
  static async uploadFiles(files) {
    const results = [];
    
    for (const file of files) {
      const validation = validateFile(file);
      
      if (!validation.isValid) {
        results.push({
          success: false,
          filename: file.name,
          errors: validation.errors
        });
        continue;
      }

      try {
        const { file_url } = await UploadFile({ file });
        results.push({
          success: true,
          filename: file.name,
          document: {
            name: file.name,
            url: file_url,
            type: file.type,
            size: file.size,
            uploaded_at: new Date().toISOString()
          }
        });
      } catch (error) {
        results.push({
          success: false,
          filename: file.name,
          errors: [`Erro no upload: ${error.message}`]
        });
      }
    }
    
    return results;
  }

  static viewFile(url) {
    window.open(url, '_blank');
  }
}