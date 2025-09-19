import { useState } from 'react';

/**
 * 파일 업로드 관련 로직을 처리하는 커스텀 훅
 * @param {Object} formData - 폼 데이터 상태
 * @param {Function} setFormData - 폼 데이터 설정 함수
 * @returns {Object} 파일 업로드 관련 상태와 함수들
 */
export const useFileUpload = (formData, setFormData) => {
  const [previewImages, setPreviewImages] = useState([]);

  // 파일 검증 함수
  const validateFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedExtensions = [
      'jpg', 'jpeg', 'png', 'gif', 'bmp', // 이미지
      'pdf', 'txt', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', // 문서
      'zip' // 압축파일
    ];
    const dangerousExtensions = [
      'exe', 'bat', 'cmd', 'com', 'scr', 'vbs', 'js', 'jar',
      'msi', 'dll', 'sys', 'ini', 'reg', 'sh', 'ps1'
    ];

    // 파일 크기 체크
    if (file.size > maxSize) {
      alert(`파일 크기가 너무 큽니다. 최대 10MB까지 업로드 가능합니다.\n선택한 파일: ${(file.size / 1024 / 1024).toFixed(1)}MB`);
      return false;
    }

    // 파일 확장자 추출
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension) {
      alert('파일 확장자를 확인할 수 없습니다.');
      return false;
    }

    // 위험한 파일 타입 체크
    if (dangerousExtensions.includes(extension)) {
      alert(`보안상 ${extension.toUpperCase()} 파일은 업로드할 수 없습니다.`);
      return false;
    }

    // 허용된 파일 타입 체크
    if (!allowedExtensions.includes(extension)) {
      alert(`지원하지 않는 파일 형식입니다.\n허용된 형식: ${allowedExtensions.join(', ').toUpperCase()}`);
      return false;
    }

    return true;
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);

    // 파일 개수 체크
    if (files.length + previewImages.length > 5) {
      alert('최대 5개의 파일까지 업로드 가능합니다.');
      return;
    }

    // 각 파일 검증
    const validFiles = [];
    for (const file of files) {
      if (validateFile(file)) {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      return; // 유효한 파일이 없으면 종료
    }

    const newPreviews = validFiles.map(file => ({
      file,
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type
    }));

    setPreviewImages(prev => [...prev, ...newPreviews]);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles]
    }));

    // 유효하지 않은 파일이 있었다면 알림
    if (validFiles.length < files.length) {
      alert(`${files.length - validFiles.length}개의 파일이 제외되었습니다. ${validFiles.length}개의 파일이 성공적으로 추가되었습니다.`);
    }
  };

  const removeFile = (id) => {
    const fileToRemove = previewImages.find(file => file.id === id);
    if (fileToRemove) {
      setPreviewImages(prev => prev.filter(file => file.id !== id));
      setFormData(prev => ({
        ...prev,
        attachments: prev.attachments.filter(file => file !== fileToRemove.file)
      }));
    }
  };

  return {
    previewImages,
    setPreviewImages,
    handleFileUpload,
    removeFile
  };
};