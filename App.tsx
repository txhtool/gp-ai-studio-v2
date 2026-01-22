import React, { useState } from 'react';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { FeatureSelector } from './components/FeatureSelector';
import { ResultView } from './components/ResultView';
import { AppStep, FeatureType, AngleOption, RoomOption, CostInfo } from './types';
import { generateFurnitureImage, MODEL_NAME } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [costInfo, setCostInfo] = useState<CostInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = (base64: string) => {
    setOriginalImage(base64);
    setStep(AppStep.SELECT_FEATURE);
    setError(null);
  };

  const handleFeatureSelect = async (feature: FeatureType, option: AngleOption | RoomOption) => {
    if (!originalImage) return;

    setStep(AppStep.PROCESSING);
    setLoading(true);
    setError(null);

    try {
      const result = await generateFurnitureImage(originalImage, feature, option);
      setResultImage(result.imageUrl);
      setCostInfo(result.cost);
      setStep(AppStep.RESULT);
    } catch (err: any) {
      console.error("Processing error:", err);
      let errorMessage = err.message || "Đã xảy ra lỗi trong quá trình xử lý.";
      
      if (errorMessage === "KEY_ERROR") {
         errorMessage = "Lỗi xác thực API Key. Vui lòng kiểm tra cấu hình.";
      } else if (
        errorMessage.includes('429') || 
        errorMessage.includes('quota') || 
        errorMessage.includes('exhausted') || 
        errorMessage.includes('Resource has been exhausted')
      ) {
        if (errorMessage.includes('limit: 0') || errorMessage.includes('limit:0')) {
             errorMessage = "Tài khoản thanh toán của bạn đã hết hạn mức. Vui lòng kiểm tra lại Google Cloud Billing.";
        } else {
             errorMessage = "Hệ thống đang bận (Quá tải). Vui lòng đợi khoảng 1 phút rồi thử lại.";
        }
      }

      setError(errorMessage);
      setStep(AppStep.SELECT_FEATURE); // Go back to selection on error
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setResultImage(null);
    setCostInfo(null);
    setStep(AppStep.UPLOAD);
    setError(null);
  };

  const handleBackToSelect = () => {
    setStep(AppStep.SELECT_FEATURE);
  };
  
  const handleBackToUpload = () => {
    setStep(AppStep.UPLOAD);
    setOriginalImage(null);
  };

  const handleDownload = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = `furniture-processed-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Processing View
  const renderProcessing = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-24 h-24 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-8"></div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Đang xử lý hình ảnh...</h2>
      <p className="text-gray-500 text-center max-w-md mb-2">
        AI đang phân tích và tái tạo không gian. Quá trình này có thể mất từ <b>15-30 giây</b> để đảm bảo chất lượng cao nhất.
      </p>
      <p className="text-indigo-500 text-sm font-medium animate-pulse mt-4">
        Chi phí ước tính: ~$0.002 / 50đ cho tác vụ này
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
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3 pr-8">
                        <h3 className="text-sm font-medium text-red-800">Lỗi xử lý</h3>
                        <div className="mt-1 text-sm text-red-700">
                          {error}
                        </div>
                      </div>
                      <div className="ml-auto pl-3">
                        <div className="-mx-1.5 -my-1.5">
                          <button
                            onClick={() => setError(null)}
                            className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none"
                          >
                            <span className="sr-only">Dismiss</span>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                 </div>
              </div>
            )}

            {step === AppStep.UPLOAD && (
              <UploadSection onImageSelected={handleImageSelected} />
            )}

            {step === AppStep.SELECT_FEATURE && originalImage && (
              <FeatureSelector 
                onSelect={handleFeatureSelect} 
                onBack={handleBackToUpload}
                imageSrc={originalImage}
              />
            )}

            {step === AppStep.PROCESSING && renderProcessing()}

            {step === AppStep.RESULT && originalImage && resultImage && (
              <ResultView 
                originalImage={originalImage}
                resultImage={resultImage}
                costInfo={costInfo}
                onReset={handleReset}
                onDownload={handleDownload}
                onGenerateMore={handleFeatureSelect}
              />
            )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} GP AI Studio.</p>
          <p className="mt-1 flex items-center justify-center gap-1">
            Powered by 
            <span className="font-semibold text-indigo-500">{MODEL_NAME}</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;