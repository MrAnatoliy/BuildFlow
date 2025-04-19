import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url,
  ).toString();

const PDFViewer = ({ pdfUrl }) => {
  const canvasRef = useRef(null);
  const [pdf, setPdf] = useState(null);
  const [page, setPage] = useState(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    loadingTask.promise.then((loadedPdf) => {
      setPdf(loadedPdf);
    });
  }, [pdfUrl]);

  useEffect(() => {
    if (pdf) {
      pdf.getPage(1).then((loadedPage) => {
        setPage(loadedPage);
      });
    }
  }, [pdf]);

  useEffect(() => {
    if (page && canvasRef.current) {
      const viewport = page.getViewport({ scale: zoom });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      page.render(renderContext);
    }
  }, [page, zoom]);

  const handleZoomIn = () => setZoom((z) => z + 0.25);
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.25));

  return (
    <div className='w-full h-full overflow-auto'>
      <div className="absolute" style={{ marginBottom: 10 }}>
        <button className="btn btn-small btn-primary z-100" onClick={handleZoomOut}>-</button>
        <button className="btn btn-small btn-primary z-100" onClick={handleZoomIn}>+</button>
      </div>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default PDFViewer; 