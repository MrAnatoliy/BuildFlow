import React, { useState, useRef } from "react";

import { RiColorFilterLine, RiFilter2Line } from "react-icons/ri";

import ZoomContainer from "../../components/layout/Zoom/ZoomContainer";
import PDFViewer from "../../components/ui/PdfViewer/PdfViewer";

const PointDetails = ({ point, onClose }) => {
    return (
        <>
            <div className="w-140 bg-base-100 shadow-md rounded-box p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Детали точки</h2>
                <button 
                onClick={onClose}
                className="btn btn-circle btn-sm btn-ghost"
                >
                ×
                </button>
            </div>
            <div className="space-y-2">
                <p><strong>ID:</strong> {point.id}</p>
                <p><strong>X:</strong> {point.x.toFixed(1)}%</p>
                <p><strong>Y:</strong> {point.y.toFixed(1)}%</p>
            </div>
            </div>
        </>
    )
}


const BlueprintView = ({ onPointSelect, points, setPoints, selectedPoint }) => {
    
    const [isAddingPoint, setIsAddingPoint] = useState(false);
    const containerRef = useRef(null);
  
    const blueprint_PDF = 'http://26.190.118.118/poliklinika.dwg.pdf'
    
    const handleImageClick = (e) => {
        if (!isAddingPoint) return;
    
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
    
        const newPoint = {
          id: Date.now(),
          x, 
          y,
          data: { comment: "Новый комментарий" }
        };
    
        setPoints(prev => [...prev, newPoint]);
        setIsAddingPoint(false);
      };
    
      const handlePointClick = (e, point) => {
        e.stopPropagation();
        onPointSelect(point);
      };

    return (
        <div className="w-full h-full flex flex-col">
            {/* Header Section */}
            <div className="flex items-cenyer grid md:grid-cols-3 grid-cols-1 items-center gap-4 w-full px-4">
                <div className="justify-self-start text-sm">Ползунок прозрачности</div>
                
                <div className="justify-self-center text-center relative">
                    <div className="font-medium">Наименование чертежа</div>
                </div>
                
                <button className="w-auto btn btn-primary btn-sm"
                     onClick={() => setIsAddingPoint(true)}>
                    {isAddingPoint ? 'Режим добавления...' : 'Создать комментарий'}
                </button>
            </div>

            <div className="w-full flex flex-row justify-center items-center bg-base-200 p-1 shadow-lg">
                Вид: Сверху
            </div>

            {/* Main Plan Content */}
            <div className="w-full h-full flex justify-center items-center overflow-hidden">
                    <div ref={containerRef} onClick={handleImageClick} className="w-full h-full z-20">
                        <PDFViewer pdfUrl="/poliklinika.dwg.pdf" />
                        {points.map(point => (
                            <div
                            key={point.id}
                            className={`absolute w-2 h-2 md:w-3 md:h-3 rounded-full cursor-pointer 
                                transform -translate-x-1/2 -translate-y-1/2 transition-all
                                ${point.id === selectedPoint?.id 
                                ? 'bg-blue-500 ring-2 md:ring-3 ring-blue-200 scale-125' 
                                : 'bg-red-500'}`}
                            style={{
                                left: `${point.x}%`,
                                top: `${point.y}%`
                            }}
                            onClick={(e) => handlePointClick(e, point)}
                            />
                        ))}
                    </div>
            </div>
        </div>
    )
};

const Blueprint = () => {
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [points, setPoints] = useState([]);

    return (
        <>
          <div className="wrapper flex flex-col md:flex-row gap-6 bg-base-200 p-4 md:p-10">

            <div className="w-full md:w-105 flex flex-col bg-base-100 rounded-box shadow-lg">
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold">Чертежи</h4>
                    <button 
                        className="btn btn-circle btn-sm btn-ghost"
                        aria-label="Помощь"
                    >
                        ?
                    </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                    <button className="w-auto h-2 btn btn-outline btn-sm p-3">
                        <span>Сортировка</span>
                        <RiColorFilterLine className="ml-2" />
                    </button>
                    <button className="w-auto h-2 btn btn-outline btn-sm p-3">
                        <span>Фильтры</span>
                        <RiFilter2Line className="ml-2" />
                    </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                    Список чертежей
                    </div>
                </div>
            </div>

            <div className="w-full h-full bg-base-100 rounded-box shadow-lg">
                <BlueprintView 
                    onPointSelect={setSelectedPoint} 
                    points={points} 
                    setPoints={setPoints}
                    selectedPoint={selectedPoint}
                />
            </div>

            {selectedPoint && (
            <PointDetails 
                point={selectedPoint} 
                onClose={() => setSelectedPoint(null)}
            />
            )}
        </div>
        </>
    )
};

export default Blueprint;