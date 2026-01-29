import React, { useState } from 'react';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { FeatureSelector } from './components/FeatureSelector';
import { ResultView } from './components/ResultView';
import { AppStep, FeatureType, AngleOption, RoomOption, BatchResultItem } from './types';
import { generateFurnitureImage, MODEL_NAME } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  
  const [inputImages, setInputImages] = useState<string[]>([]);
  const [batchResults, setBatchResults] = useState<BatchResultItem[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const handleImagesSelected = (base64List: string[]) => {
    setInputImages(base64List);
    setStep(AppStep.SELECT_FEATURE);
    setError(null);
  };

  const handleFeatureSelect = async (
    feature: FeatureType, 
    option: AngleOption | RoomOption | string,
    specificInputImage?: string
  ) => {
    const imagesToProcess = specificInputImage ? [specificInputImage] : inputImages;

    if (imagesToProcess.length === 0) return;

    setStep(AppStep.PROCESSING);
    setLoading(true);
    setProgress({ current: 0, total: imagesToProcess.length });
    setError(null);
    
    const newResults: BatchResultItem[] = [];
    const errors: string[] = [];

    try {
      for (let i = 0; i < imagesToProcess.length; i++) {
        const img = imagesToProcess[i];
        try {
          setProgress({ current: i + 1, total: imagesToProcess.length });
          
          // Delay to prevent rate limiting (1.5s)
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 1500));
          }

          const result = await generateFurnitureImage(img, feature, option);
          
          newResults.push({
            id: `res-${Date.now()}-${i}`,
            original: img,
            processed: result.imageUrl,
            cost: result.cost
          });
        } catch (innerErr: any) {
           console.error(`Error processing image ${i}:`, innerErr);
           const msg = innerErr.message || "Unknown error";
           errors.push(`Ảnh ${i + 1}: ${msg}`);
           
           if (msg === "KEY_ERROR") {
             throw innerErr;
           }
        }
      }
      
      if (newResults.length === 0) {
        // If all failed, show the first error detail
        throw new Error(errors[0] || "Không thể xử lý bất kỳ ảnh nào. Vui lòng thử lại.");
      }

      // If some failed but some succeeded, maybe warn user? 
      // For now, just show what succeeded.
      setBatchResults(prev => specificInputImage ? [...newResults] : newResults);
      setStep(AppStep.RESULT);

      if (errors.length > 0) {
        setError(`Đã xử lý ${newResults.length}/${imagesToProcess.length} ảnh. Lỗi: ${errors.length} ảnh.`);
      }

    } catch (err: any) {
      console.error("Processing error:", err);
      let errorMessage = err.message || "Đã xảy ra lỗi trong quá trình xử lý.";
      
      if (errorMessage === "KEY_ERROR") {
         errorMessage = "Lỗi xác thực API Key. Vui lòng kiểm tra file .env ở phía Server/Vercel.";
      } else if (
        errorMessage.includes('429') || 
        errorMessage.includes('quota') || 
        errorMessage.includes('exhausted')
      ) {
         errorMessage = "Hệ thống đang quá tải hoặc hết hạn mức. Vui lòng thử lại sau.";
      }

      setError(errorMessage);
      setStep(AppStep.SELECT_FEATURE); 
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setInputImages([]);
    setBatchResults([]);
    setStep(AppStep.UPLOAD);
    setError(null);
  };

  const handleBackToSelect = () => {
    setStep(AppStep.SELECT_FEATURE);
  };
  
  const handleBackToUpload = () => {
    setStep(AppStep.UPLOAD);
    setInputImages([]);
  };

  const handleDownload = () => {
    if (batchResults.length === 1) {
      const link = document.createElement('a');
      link.href = batchResults[0].processed;
      link.download = `furniture-processed-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
        batchResults.forEach((res, idx) => {
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = res.processed;
                link.download = `batch-processed-${idx}-${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, idx * 500);
        });
    }
  };

  const renderProcessing = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-24 h-24 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-8"></div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Đang xử lý hình ảnh...</h2>
      <p className="text-gray-500 text-center max-w-md mb-2">
        AI đang phân tích và xử lý. 
        {progress.total > 1 && (
            <span className="block mt-2 font-semibold text-indigo-600">
                Đang xử lý ảnh {progress.current} / {progress.total}
            </span>
        )}
      </p>
      <p className="text-indigo-500 text-sm font-medium animate-pulse mt-4">
        Chi phí ước tính: ~$0.002 / ảnh
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-grow w-full">
            {error && (
              <div className="max-w-4xl mx-auto mt-6 px-4">
                 <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative shadow-sm" role="alert">
                    <div className="flex items-start">
                        <span className="text-red-500 mr-2">⚠️</span>
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="ml-auto text-red-500 font-bold">✕</button>
                    </div>
                 </div>
              </div>
            )}

            {step === AppStep.UPLOAD && (
              <UploadSection onImagesSelected={handleImagesSelected} />
            )}

            {step === AppStep.SELECT_FEATURE && inputImages.length > 0 && (
              <FeatureSelector 
                onSelect={handleFeatureSelect} 
                onBack={handleBackToUpload}
                images={inputImages}
              />
            )}

            {step === AppStep.PROCESSING && renderProcessing()}

            {step === AppStep.RESULT && batchResults.length > 0 && (
              <ResultView 
                results={batchResults}
                onReset={handleReset}
                onBack={handleBackToSelect}
                onDownload={handleDownload}
                onGenerateMore={handleFeatureSelect}
              />
            )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <h3 className="text-lg font-bold text-gray-900">GP AI Studio</h3>
           <p className="text-sm text-gray-500 mt-1">Phiên bản V3.1 (Stable Fix)</p>
           <div className="flex flex-wrap justify-center gap-4 mt-3 text-sm font-medium text-gray-600">
              <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-teal-500 mr-2"></span>Tách nền hàng loạt</span>
              <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2"></span>Phối cảnh không gian</span>
              <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>Góc nhìn đa chiều</span>
           </div>
           
           <div className="border-t border-gray-100 mt-6 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
             <p>&copy; {new Date().getFullYear()} GP AI Studio. All rights reserved.</p>
             <p className="mt-2 md:mt-0 flex items-center gap-1">
               Powered by <span className="font-semibold text-indigo-500">{MODEL_NAME}</span>
             </p>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;