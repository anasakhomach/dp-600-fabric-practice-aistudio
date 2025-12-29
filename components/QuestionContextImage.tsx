import React, { useState } from 'react';
import { ZoomIn, X } from 'lucide-react';

interface Props {
  imageUrl: string;
  altText?: string;
}

const QuestionContextImage: React.FC<Props> = ({ imageUrl, altText = "Question Exhibit" }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!imageUrl) return null;

  return (
    <>
      {/* Thumbnail / Inline View */}
      <div className="mb-6 group relative w-fit">
        <div 
          className="relative rounded-xl overflow-hidden border border-slate-200 cursor-zoom-in shadow-sm hover:shadow-md transition-all"
          onClick={() => setIsOpen(true)}
        >
          <img 
            src={imageUrl} 
            alt={altText} 
            className="max-h-[300px] object-contain bg-slate-50"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
            <div className="bg-white/90 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                <ZoomIn size={20} className="text-slate-600" />
            </div>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-400 font-medium uppercase tracking-wide">
          Tap image to zoom
        </p>
      </div>

      {/* Lightbox / Modal View */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X size={32} />
          </button>
          
          <div 
            className="relative max-w-full max-h-full overflow-auto rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
          >
            <img 
              src={imageUrl} 
              alt={altText} 
              className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default QuestionContextImage;
