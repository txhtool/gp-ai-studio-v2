import React, { useState } from 'react';
import { Button } from './Button';
import { FeatureType, AngleOption, RoomOption, BatchResultItem } from '../types';

interface ResultViewProps {
  results: BatchResultItem[];
  onReset: () => void;
  onBack: () => void;
  onDownload: () => void;
  onGenerateMore: (feature: FeatureType, option: AngleOption | RoomOption | string, specificInputImage?: string) => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ 
  results,
  onReset, 
  onBack,
  onDownload,
  onGenerateMore 
}) => {
  const isBatch = results.length > 1;
  const primaryResult = results[0];

  const [isCustomSceneMode, setIsCustomSceneMode] = useState(false);
  const [customScenePrompt, setCustomScenePrompt] = useState('');
  const [isCustomAngleMode, setIsCustomAngleMode] = useState(false);
  const [customAnglePrompt, setCustomAnglePrompt] = useState('');

  const quickAngles = [
    { label: 'Chính diện', value: AngleOption.FRONT },
    { label: 'Góc nghiêng', value: AngleOption.SLANTED },
    { label: 'Mặt sau', value: AngleOption.BACK },
    { label: 'Trên cao', value: AngleOption.TOP_DOWN },
  ];

  const quickRooms = [
    { label: 'Phòng khách', value: RoomOption.LIVING_ROOM, icon: '🛋️' },
    { label: 'Phòng ngủ', value: RoomOption.BEDROOM, icon: '🛏️' },
  ];

  const handleCustomSceneSubmit = () => {
    if (customScenePrompt.trim()) {
      // Use processed image as input for next step
      onGenerateMore(FeatureType.SCENE_PLACEMENT, customScenePrompt.trim(), primaryResult.processed);
    }
  };

  const handleCustomAngleSubmit = () => {
    if (customAnglePrompt.trim()) {
      // Use original image for re-angling
      onGenerateMore(FeatureType.MULTI_ANGLE, customAnglePrompt.trim(), primaryResult.original);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4 pb-12">
      <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
             {isBatch ? `Kết quả xử lý hàng loạt (${results.length} ảnh)` : 'Kết quả xử lý (V3)'}
          </h2>
          <div className="flex items-center mt-1 space-x-2">
            <span className="text-xs text-green-600 font-medium flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              Hoàn tất (Server-side)
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onBack}>
             <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
             Quay lại
          </Button>
          <Button variant="outline" onClick={onReset}>
            Tải dự án mới
          </Button>
          <Button onClick={onDownload}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Tải tất cả
          </Button>
        </div>
      </div>

      {isBatch ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {results.map((item, idx) => (
                  <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-4">
                      <div className="w-1/3 space-y-2">
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                             <img src={item.original} className="w-full h-full object-contain" alt="Org" />
                          </div>
                          <p className="text-xs text-center text-gray-500">Gốc</p>
                      </div>
                      <div className="flex items-center justify-center text-gray-300">
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                      </div>
                      <div className="w-1/3 space-y-2">
                          <div className="aspect-square bg-checkered rounded-lg overflow-hidden border border-teal-200 relative group">
                             <img src={item.processed} className="w-full h-full object-contain" alt="Proc" />
                             <a 
                               href={item.processed} 
                               download={`processed-${idx}.png`}
                               className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                             >
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                             </a>
                          </div>
                          <p className="text-xs text-center text-teal-600 font-bold">Kết quả</p>
                      </div>
                  </div>
              ))}
          </div>
      ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                <div className="space-y-3">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm h-[400px] flex items-center justify-center bg-checkered">
                    <img src={primaryResult.original} alt="Original" className="max-w-full max-h-full object-contain" />
                </div>
                <p className="text-center font-medium text-gray-600">Ảnh gốc</p>
                </div>

                <div className="space-y-3">
                <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-md h-[400px] flex items-center justify-center bg-checkered relative overflow-hidden group">
                    <img src={primaryResult.processed} alt="Processed" className="max-w-full max-h-full object-contain" />
                </div>
                <p className="text-center font-medium text-indigo-600">Ảnh đã xử lý</p>
                </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Tiếp tục xử lý từ kết quả này
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-1 bg-indigo-50 rounded-xl p-5 border border-indigo-100 h-full">
                    <p className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-3 flex items-center">
                    <span className="mr-2 text-xl">🏙️</span> Phối cảnh không gian
                    </p>
                    {!isCustomSceneMode ? (
                        <div className="grid grid-cols-2 gap-3">
                        {quickRooms.map((room) => (
                            <button
                            key={room.value}
                            onClick={() => onGenerateMore(FeatureType.SCENE_PLACEMENT, room.value, primaryResult.processed)}
                            className="flex items-center justify-center p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm"
                            >
                            <span className="mr-2">{room.icon}</span>
                            <span className="text-xs font-medium">{room.label}</span>
                            </button>
                        ))}
                        <button onClick={() => setIsCustomSceneMode(true)} className="flex items-center justify-center p-3 bg-white border border-indigo-200 text-indigo-600 rounded-lg col-span-2">
                             ✨ Tùy chỉnh
                        </button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                             <input type="text" className="flex-grow text-sm border p-2 rounded" value={customScenePrompt} onChange={e => setCustomScenePrompt(e.target.value)} />
                             <Button onClick={handleCustomSceneSubmit} className="py-1 px-3">Go</Button>
                        </div>
                    )}
                </div>
                <div className="md:col-span-1 bg-gray-50 rounded-xl p-5 border border-gray-200 h-full">
                     <p className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center">
                        <span className="mr-2 text-xl">🔄</span> Tạo góc nhìn khác
                    </p>
                    {!isCustomAngleMode ? (
                        <div className="grid grid-cols-2 gap-3">
                             {quickAngles.map((angle) => (
                                <button key={angle.value} onClick={() => onGenerateMore(FeatureType.MULTI_ANGLE, angle.value, primaryResult.original)} className="p-3 bg-white border border-gray-200 rounded-lg text-xs">
                                    {angle.label}
                                </button>
                             ))}
                             <button onClick={() => setIsCustomAngleMode(true)} className="p-3 bg-white border border-indigo-200 text-indigo-600 rounded-lg col-span-2 text-xs font-bold">✨ Tùy chỉnh</button>
                        </div>
                    ) : (
                         <div className="flex gap-2">
                             <input type="text" className="flex-grow text-sm border p-2 rounded" value={customAnglePrompt} onChange={e => setCustomAnglePrompt(e.target.value)} />
                             <Button onClick={handleCustomAngleSubmit} className="py-1 px-3">Go</Button>
                        </div>
                    )}
                </div>
                </div>
            </div>
          </>
      )}
    </div>
  );
};