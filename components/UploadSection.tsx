import React, { useState } from 'react';

interface UploadSectionProps {
  onImagesSelected: (base64List: string[]) => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onImagesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      await processFiles(files);
      // Reset input value to allow selecting the same file again if needed
      e.target.value = '';
    }
  };

  const processFiles = async (files: File[]) => {
    // Filter for supported web images only
    const imageFiles = files.filter(file => 
      file.type === 'image/jpeg' || 
      file.type === 'image/png' || 
      file.type === 'image/webp' ||
      file.name.toLowerCase().endsWith('.jpg') ||
      file.name.toLowerCase().endsWith('.jpeg') ||
      file.name.toLowerCase().endsWith('.png') ||
      file.name.toLowerCase().endsWith('.webp')
    );
    
    if (imageFiles.length === 0) {
      alert('Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, WEBP). File HEIC không được hỗ trợ trên trình duyệt.');
      return;
    }

    if (imageFiles.length > 5) {
      alert('Vui lòng chỉ chọn tối đa 5 ảnh để xử lý hàng loạt.');
      return;
    }

    try {
      const promises = imageFiles.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result);
            } else {
              reject(new Error("File conversion failed"));
            }
          };
          
          reader.onerror = () => {
            reject(new Error("Error reading file"));
          };
          
          reader.readAsDataURL(file);
        });
      });

      const base64List = await Promise.all(promises);
      onImagesSelected(base64List);
    } catch (error) {
      console.error("File processing error:", error);
      alert("Đã xảy ra lỗi khi đọc file. Vui lòng thử lại với ảnh khác.");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6">
      <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">Bắt đầu dự án mới</h2>
      <p className="text-center text-gray-500 mb-8">
        Tải lên hình ảnh sản phẩm nội thất (Hỗ trợ xử lý hàng loạt tối đa 5 ảnh)
      </p>
      
      <div 
        className={`relative border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer bg-white
          ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          accept=".jpg, .jpeg, .png, .webp" 
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileInput}
        />
        
        <div className="bg-indigo-100 p-4 rounded-full mb-4">
          <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        
        <p className="text-lg font-medium text-gray-900 mb-1">Kéo thả ảnh vào đây</p>
        <p className="text-sm text-gray-500 text-center">hoặc nhấp để chọn từ máy tính<br/>(Chọn nhiều ảnh để tách nền hàng loạt)</p>
        <p className="text-xs text-gray-400 mt-4">Hỗ trợ JPG, PNG, WEBP (Max 5 files)</p>
      </div>
    </div>
  );
};