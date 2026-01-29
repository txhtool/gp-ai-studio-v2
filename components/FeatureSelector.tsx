import React, { useState } from 'react';
import { FeatureType, AngleOption, RoomOption } from '../types';
import { Button } from './Button';

interface FeatureSelectorProps {
  onSelect: (feature: FeatureType, option: AngleOption | RoomOption | string) => void;
  onBack: () => void;
  images: string[];
}

export const FeatureSelector: React.FC<FeatureSelectorProps> = ({ onSelect, onBack, images }) => {
  const [selectedFeature, setSelectedFeature] = useState<FeatureType | null>(null);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  const isBatchMode = images.length > 1;

  const handleCustomSubmit = () => {
    if (customPrompt.trim() && selectedFeature) {
      onSelect(selectedFeature, customPrompt.trim());
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.style.display = 'none';
    e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center', 'bg-gray-200');
    if (e.currentTarget.parentElement) {
      e.currentTarget.parentElement.innerText = 'Lỗi hiển thị ảnh';
    }
  };

  const renderOptions = () => {
    if (selectedFeature === FeatureType.MULTI_ANGLE) {
      return (
        <div className="mt-6">
          {isCustomMode ? (
            <div className="bg-white p-6 rounded-xl border border-indigo-200 shadow-sm animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <span className="text-xl mr-2">✨</span>
                  Mô tả góc nhìn mong muốn
                </h4>
                <button 
                  onClick={() => setIsCustomMode(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                >
                  Quay lại danh sách
                </button>
              </div>
              
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Ví dụ: Cận cảnh chi tiết vân gỗ ở chân ghế, hoặc góc nhìn từ dưới lên..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px] text-gray-700 mb-4"
                autoFocus
              />
              
              <div className="flex justify-end gap-3">
                <Button 
                  variant="primary" 
                  onClick={handleCustomSubmit}
                  disabled={!customPrompt.trim()}
                >
                  Tạo góc nhìn này
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Chính diện', value: AngleOption.FRONT, icon: '⏹️', desc: 'Mặt trước' },
                { label: 'Góc nghiêng', value: AngleOption.SLANTED, icon: '📐', desc: 'Nghiêng nhẹ' },
                { label: 'Góc 3/4', value: AngleOption.THREE_QUARTER, icon: '↘️', desc: 'Góc chéo' },
                { label: 'Góc trái', value: AngleOption.LEFT, icon: '⬅️', desc: 'Trái' },
                { label: 'Góc phải', value: AngleOption.RIGHT, icon: '➡️', desc: 'Phải' },
                { label: 'Góc sau', value: AngleOption.BACK, icon: '🔙', desc: 'Mặt lưng' },
                { label: 'Trên cao', value: AngleOption.TOP_DOWN, icon: '⬇️', desc: 'Từ trên xuống' },
                { label: 'Góc thấp', value: AngleOption.LOW_ANGLE, icon: '🆙', desc: 'Hắt lên' },
                { label: 'Tùy chỉnh', value: AngleOption.CUSTOM, icon: '✨', desc: 'Mô tả riêng' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    if (opt.value === AngleOption.CUSTOM) {
                      setIsCustomMode(true);
                    } else {
                      onSelect(FeatureType.MULTI_ANGLE, opt.value);
                    }
                  }}
                  className={`flex flex-col items-center p-3 sm:p-4 bg-white border rounded-xl hover:shadow-md transition-all text-center group relative overflow-hidden
                    ${opt.value === AngleOption.CUSTOM ? 'border-indigo-200 hover:border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-500'}`}
                >
                  <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{opt.icon}</span>
                  <span className="font-medium text-gray-900 text-sm">{opt.label}</span>
                  <span className="text-xs text-gray-500 mt-1">{opt.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (selectedFeature === FeatureType.SCENE_PLACEMENT) {
      return (
        <div className="mt-6">
          {isCustomMode ? (
            <div className="bg-white p-6 rounded-xl border border-indigo-200 shadow-sm animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <span className="text-xl mr-2">✨</span>
                  Mô tả không gian mong muốn
                </h4>
                <button 
                  onClick={() => setIsCustomMode(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                >
                  Quay lại danh sách
                </button>
              </div>
              
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Ví dụ: Một căn hộ penthouse sang trọng nhìn ra biển lúc hoàng hôn, phong cách tối giản, sàn gỗ sáng màu..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px] text-gray-700 mb-4"
                autoFocus
              />
              
              <div className="flex justify-end gap-3">
                <Button 
                  variant="primary" 
                  onClick={handleCustomSubmit}
                  disabled={!customPrompt.trim()}
                >
                  Tạo phối cảnh này
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Phòng khách', value: RoomOption.LIVING_ROOM, icon: '🛋️', desc: 'Living Room' },
                { label: 'Phòng ăn', value: RoomOption.DINING_ROOM, icon: '🍽️', desc: 'Dining Room' },
                { label: 'Phòng ngủ', value: RoomOption.BEDROOM, icon: '🛏️', desc: 'Bedroom' },
                { label: 'Văn phòng', value: RoomOption.OFFICE, icon: '💼', desc: 'Home Office' },
                { label: 'Sân vườn', value: RoomOption.OUTDOOR, icon: '🌳', desc: 'Outdoor' },
                { label: 'Tùy chỉnh', value: RoomOption.CUSTOM, icon: '✨', desc: 'Nhập mô tả riêng' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    if (opt.value === RoomOption.CUSTOM) {
                      setIsCustomMode(true);
                    } else {
                      onSelect(FeatureType.SCENE_PLACEMENT, opt.value);
                    }
                  }}
                  className={`flex flex-col items-center p-6 bg-white border rounded-xl hover:shadow-md transition-all text-center group relative overflow-hidden
                    ${opt.value === RoomOption.CUSTOM ? 'border-indigo-200 hover:border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-500'}`}
                >
                  <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">{opt.icon}</span>
                  <span className="font-medium text-gray-900">{opt.label}</span>
                  <span className="text-xs text-gray-500 mt-1">{opt.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    if (selectedFeature === FeatureType.BACKGROUND_REMOVAL) {
        return (
            <div className="mt-6 bg-white p-6 rounded-xl border border-teal-200 shadow-sm animate-fade-in">
                <h4 className="font-semibold text-gray-900 mb-2">Chế độ tách nền {isBatchMode ? 'hàng loạt' : 'Studio'}</h4>
                <p className="text-sm text-gray-600 mb-4">
                  {isBatchMode 
                    ? `Hệ thống sẽ tự động xử lý ${images.length} ảnh. Nền sẽ được xóa hoàn toàn (Trong suốt/PNG).`
                    : 'Hệ thống sẽ tự động tách chủ thể và xóa nền (Trong suốt/PNG).'}
                </p>
                <div className="flex justify-end">
                    <Button 
                        variant="primary" 
                        onClick={() => onSelect(FeatureType.BACKGROUND_REMOVAL, 'Transparent/PNG')}
                        className="bg-teal-600 hover:bg-teal-700 focus:ring-teal-500"
                    >
                        {isBatchMode ? `Tách nền ${images.length} ảnh` : 'Tiến hành tách nền'}
                    </Button>
                </div>
            </div>
        )
    }

    return null;
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4 pb-20">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-900 mr-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-900">
          {isBatchMode ? 'Chọn phương thức xử lý hàng loạt' : 'Chọn phương thức xử lý (V3)'}
        </h2>
      </div>
      
      {isBatchMode && (
        <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-sm font-medium">Bạn đang chọn {images.length} ảnh. Chỉ tính năng "Tách nền hàng loạt" khả dụng.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="md:col-span-1">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm sticky top-24">
             {isBatchMode ? (
                <div className="grid grid-cols-2 gap-2">
                   {images.slice(0, 4).map((img, idx) => (
                      <div key={idx} className="aspect-square rounded overflow-hidden bg-gray-100 relative h-24">
                         <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" onError={handleImageError} />
                      </div>
                   ))}
                   {images.length > 4 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white font-bold rounded">
                        +{images.length - 4}
                      </div>
                   )}
                </div>
             ) : (
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2 min-h-[200px] flex items-center justify-center">
                    <img 
                        src={images[0]} 
                        alt="Original" 
                        className="w-full h-full object-contain" 
                        onError={handleImageError}
                    />
                </div>
             )}
             <p className="text-center text-sm font-medium text-gray-500 mt-2">
                {isBatchMode ? `${images.length} Ảnh đã chọn` : 'Ảnh gốc'}
             </p>
          </div>
        </div>

        <div className="md:col-span-2">
          {!selectedFeature ? (
            <div className="grid grid-cols-1 gap-4">
              {/* Feature Cards */}
              <button
                disabled={isBatchMode}
                onClick={() => setSelectedFeature(FeatureType.MULTI_ANGLE)}
                className={`flex items-center p-5 bg-white border border-gray-200 rounded-xl transition-all text-left group
                  ${isBatchMode ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-500 hover:shadow-lg'}`}
              >
                <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mr-5 text-blue-600 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Góc nhìn đa chiều</h3>
                  <p className="text-sm text-gray-500">Xoay sản phẩm, tạo các góc nhìn trước, sau, trên, dưới.</p>
                </div>
              </button>

              <button
                disabled={isBatchMode}
                onClick={() => setSelectedFeature(FeatureType.SCENE_PLACEMENT)}
                className={`flex items-center p-5 bg-white border border-gray-200 rounded-xl transition-all text-left group
                  ${isBatchMode ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-500 hover:shadow-lg'}`}
              >
                <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mr-5 text-purple-600 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Phối cảnh không gian</h3>
                  <p className="text-sm text-gray-500">Đặt sản phẩm vào phòng khách, phòng ngủ, sân vườn.</p>
                </div>
              </button>

              {/* Background Removal Card - Always Active or Active for Batch */}
              <button
                onClick={() => setSelectedFeature(FeatureType.BACKGROUND_REMOVAL)}
                className="flex items-center p-5 bg-white border border-gray-200 rounded-xl hover:border-teal-500 hover:shadow-lg transition-all text-left group ring-2 ring-transparent focus:ring-teal-500"
              >
                <div className="w-14 h-14 bg-teal-100 rounded-lg flex items-center justify-center mr-5 text-teal-600 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isBatchMode ? 'Tách nền hàng loạt' : 'Tách nền Studio'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isBatchMode 
                        ? 'Tự động xử lý danh sách ảnh, xóa sạch nền (PNG).' 
                        : 'Tự động tách chủ thể, tạo nền trong suốt (PNG).'}
                  </p>
                </div>
              </button>
            </div>
          ) : (
            <div>
               <button 
                  onClick={() => {
                    setSelectedFeature(null);
                    setIsCustomMode(false);
                    setCustomPrompt('');
                  }}
                  className="mb-4 text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
               >
                 <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                 Chọn lại tính năng
               </button>
               <h3 className="text-lg font-medium text-gray-800 mb-4">
                 {selectedFeature === FeatureType.MULTI_ANGLE && 'Chọn góc nhìn chi tiết'}
                 {selectedFeature === FeatureType.SCENE_PLACEMENT && 'Chọn không gian nội thất'}
                 {selectedFeature === FeatureType.BACKGROUND_REMOVAL && 'Cấu hình tách nền'}
               </h3>
               {renderOptions()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};