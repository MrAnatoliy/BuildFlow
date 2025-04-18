import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

const PDFViewer = ({ pdfUrl }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [pdf, setPdf] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(null);
  const [rotation, setRotation] = useState(0);
  
  const transformState = useRef({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    lastX: 0,
    lastY: 0,
    isDragging: false,
    centerX: 0,
    centerY: 0
  });

  const ControlsPDF = useCallback(() => {
    const handlePrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
    const handleNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));

    return (
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 rounded-lg p-2 flex gap-4 shadow-md">
        <button className="btn btn-small btn-primary" onClick={handlePrevPage} disabled={currentPage === 1}>
          ←
        </button>
        <span className="px-4 py-1">
          Page {currentPage} of {totalPages}
        </span>
        <button className="btn btn-small btn-primary" onClick={handleNextPage} disabled={currentPage === totalPages}>
          →
        </button>
      </div>
    );
  }, [currentPage, totalPages]);

  const PDFControls = useCallback(() => {
    const calculateNewOffset = (newRotation) => {
      const container = containerRef.current;
      if (!container) return { x: 0, y: 0 };
      
      const rect = container.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const angle = (newRotation - rotation) * Math.PI / 180;
      const currentScale = transformState.current.scale;
      
      const dx = (centerX - transformState.current.centerX) / currentScale;
      const dy = (centerY - transformState.current.centerY) / currentScale;
      
      return {
        x: transformState.current.offsetX + dx * Math.cos(angle) - dy * Math.sin(angle),
        y: transformState.current.offsetY + dx * Math.sin(angle) + dy * Math.cos(angle)
      };
    };

    const handleZoom = (delta) => {
      const newScale = Math.min(3, Math.max(0.5, transformState.current.scale + delta));
      transformState.current.scale = newScale;
      updateCanvasTransform();
    };

    const handleRotate = () => {
      const newRotation = (rotation + 90) % 360;
      const newOffset = calculateNewOffset(newRotation);
      
      transformState.current.offsetX = newOffset.x;
      transformState.current.offsetY = newOffset.y;
      setRotation(newRotation);
      updateCanvasTransform();
    };

    const handleReset = () => {
      transformState.current.scale = 1;
      transformState.current.offsetX = 0;
      transformState.current.offsetY = 0;
      setRotation(0);
      updateCanvasTransform();
    };

    return (
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 rounded-lg p-2 flex gap-2 shadow-md">
        <button className="btn btn-small btn-primary" onClick={() => handleZoom(0.2)}>
          +
        </button>
        <button className="btn btn-small btn-primary" onClick={() => handleZoom(-0.2)}>
          -
        </button>
        <button className="btn btn-small btn-primary" onClick={handleReset}>
          ⌂
        </button>
        <button className="btn btn-small btn-primary" onClick={handleRotate}>
          ↺ {rotation}°
        </button>
      </div>
    );
  }, [rotation]);

  const updateCanvasTransform = useCallback(() => {
    if (!containerRef.current) return;
    
    const { scale, offsetX, offsetY } = transformState.current;
    containerRef.current.style.transform = `
      translate(${offsetX}px, ${offsetY}px)
      scale(${scale})
      rotate(${rotation}deg)
    `;
    
    const rect = containerRef.current.getBoundingClientRect();
    transformState.current.centerX = rect.width / 2;
    transformState.current.centerY = rect.height / 2;
  }, [rotation]);

  const handleMouseDown = useCallback(e => {
    if (e.button === 0) {
      transformState.current.isDragging = true;
      transformState.current.lastX = e.clientX;
      transformState.current.lastY = e.clientY;
      document.body.style.cursor = 'grabbing';
    }
  }, []);

  const handleMouseMove = useCallback(e => {
    if (!transformState.current.isDragging) return;

    const dx = e.clientX - transformState.current.lastX;
    const dy = e.clientY - transformState.current.lastY;
    
    transformState.current.offsetX += dx;
    transformState.current.offsetY += dy;
    transformState.current.lastX = e.clientX;
    transformState.current.lastY = e.clientY;

    updateCanvasTransform();
  }, [updateCanvasTransform]);

  const handleMouseUp = useCallback(() => {
    transformState.current.isDragging = false;
    document.body.style.cursor = 'default';
  }, []);

  const handleWheel = useCallback(e => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    transformState.current.scale = Math.min(3, Math.max(0.5, transformState.current.scale + delta));
    updateCanvasTransform();
  }, [updateCanvasTransform]);

  const renderPage = useCallback(async () => {
    if (!page || !canvasRef.current) return;

    const viewport = page.getViewport({ 
      scale: 1,
      rotation: rotation
    });
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const devicePixelRatio = window.devicePixelRatio || 1;

    canvas.width = viewport.width * devicePixelRatio;
    canvas.height = viewport.height * devicePixelRatio;
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;

    context.scale(devicePixelRatio, devicePixelRatio);
    
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    
    await page.render(renderContext).promise;
  }, [page, rotation]);

  useEffect(() => {
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    loadingTask.promise.then(loadedPdf => {
      setPdf(loadedPdf);
      setTotalPages(loadedPdf.numPages);
    });
  }, [pdfUrl]);

  useEffect(() => {
    if (pdf && currentPage <= pdf.numPages) {
      pdf.getPage(currentPage).then(setPage);
    }
  }, [pdf, currentPage]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <ControlsPDF />
      <PDFControls />
      
      <div
        ref={containerRef}
        className="will-change-transform transition-transform duration-100 ease-linear origin-center"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default PDFViewer;