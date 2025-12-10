import PropTypes from 'prop-types';
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/components/utils/formatters";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Download, Eye, Image, FileIcon } from "lucide-react";

export default function DocumentViewer({ documents = [], isOpen, onClose, processTitle }) {
  const getFileIcon = (type) => {
    if (type === 'application/pdf') return <FileText className="w-5 h-5 text-red-600" />;
    if (type.startsWith('image/')) return <Image className="w-5 h-5 text-blue-600" />;
    return <FileIcon className="w-5 h-5 text-gray-600" />;
  };


  const handleDownload = (url, name) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!documents || documents.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documentos do Processo
          </DialogTitle>
          {processTitle && (
            <p className="text-sm text-gray-500">{processTitle}</p>
          )}
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {documents.map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                {getFileIcon(doc.type)}
                <div>
                  <p className="font-medium text-gray-900">{doc.name}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>{formatFileSize(doc.size)}</span>
                    {doc.uploaded_at && (
                      <>
                        <span>•</span>
                        <span>
                          {new Date(doc.uploaded_at).toLocaleDateString('pt-BR')}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleView(doc.url)}
                  className="flex items-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  Visualizar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(doc.url, doc.name)}
                  className="flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Baixar
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

DocumentViewer.propTypes = {
  documents: PropTypes.array,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  processTitle: PropTypes.string,
}
