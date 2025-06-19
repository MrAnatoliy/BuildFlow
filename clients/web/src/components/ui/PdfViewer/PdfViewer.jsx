// PDFViewer.jsx
import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import usePanAndZoom from '../../../hooks/zoom/usePanAndZoom';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString();

const PDFViewer = ({ pdfUrl }) => {
  const canvasRef = useRef(null);
  const [pdf, setPdf] = useState(null);
  const [page, setPage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoomScale, setZoomScale] = useState(2);

  const {
    containerRef,
    onMouseDown,
    onWheel,
    translateX,
    translateY,
    scale,
    zoomTo,
  } = usePanAndZoom();

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setIsLoading(true);
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const loadedPdf = await loadingTask.promise;
        setPdf(loadedPdf);
        
        const firstPage = await loadedPdf.getPage(1);
        setPage(firstPage);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadPdf();
  }, [pdfUrl]);

  useEffect(() => {
    if (!page || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        const viewport = page.getViewport({ 
          scale: zoomScale,
          rotation: page.rotate // Учитываем ориентацию страницы
        });
        
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        // Устанавливаем размеры с учетом ориентации
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Применяем трансформации для корректного отображения
        const transform = page.rotate % 180 !== 0 
          ? [0, 1, -1, 0, viewport.height, 0] 
          : null;

        await page.render({
          canvasContext: context,
          viewport,
          transform
        }).promise;

      } catch (err) {
        setError('Ошибка рендеринга страницы');
      }
    };

    renderPage();
  }, [page, zoomScale]);

  const handleZoom = (factor) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Получаем текущий scale из состояния panAndZoom
    const currentScale = scale;
    let newScale = currentScale * factor;

    // Проверяем, не выходит ли новый масштаб за границы
    // (хотя это уже делается в reducer, но здесь мы можем избежать лишнего dispatch)
    if (newScale < 0.1 || newScale > 3.0) return;

    zoomTo(centerX, centerY, factor);
    setZoomScale(newScale)
  };

  if (isLoading) return <div>Загрузка PDF...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-2 left-2 z-10 space-x-2">
        <button 
          className="btn btn-small btn-primary" 
          onClick={() => handleZoom(0.9)}
        >
          -
        </button>
        <button 
          className="btn btn-small btn-primary" 
          onClick={() => handleZoom(1.1)}
        >
          +
        </button>
      </div>
      <div
        ref={containerRef}
        className="h-full w-full overflow-hidden"
        onMouseDown={onMouseDown}
        onWheel={onWheel}
      >
        <div
          style={{
            transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
            transformOrigin: '0 0' // Фиксируем точку трансформации
          }}
        >
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;