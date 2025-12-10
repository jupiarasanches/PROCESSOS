import { supabase } from '@/lib/supabaseClient';
import { validateFile } from '@/utils/validators';

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
        const path = `uploads/${crypto.randomUUID().replace(/-/g,'')}-${file.name}`;
        const { data: storageRes, error: storageErr } = await supabase.storage.from('documents').upload(path, file, { upsert: true });
        if (storageErr) throw storageErr;
        const publicUrl = supabase.storage.from('documents').getPublicUrl(storageRes.path).data.publicUrl;

        const { data: doc, error: insertErr } = await supabase
          .from('documents')
          .insert({ file_name: file.name, mime_type: file.type, size: file.size, storage_path: storageRes.path, status: 'active' })
          .select('*')
          .maybeSingle();
        if (insertErr) throw insertErr;

        results.push({
          success: true,
          filename: file.name,
          document: {
            id: doc.id,
            name: file.name,
            url: publicUrl,
            file_url: publicUrl,
            type: file.type,
            size: file.size,
            uploaded_at: doc.uploaded_at
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
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
