import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";

const ZoomContainer = ({ children }) => {

    const Controls = () => {
        const { zoomIn, zoomOut, resetTransform } = useControls();
        
        return (
          <div className="absolute bottom-[60px] right-[80px] flex flex-row gap-2 z-100">
            <button className="h-7 btn btn-primary btn-sm text-white" onClick={() => zoomIn()}>+</button>
            <button className="h-7 btn btn-primary btn-sm text-white" onClick={() => zoomOut()}>-</button>
            <button className="h-7 btn btn-primary btn-sm text-white" onClick={() => resetTransform()}>Reset</button>
          </div>
        );
    };

    return (
      <TransformWrapper
        initialScale={0.85}
        minScale={0.85}btn-sm 
        maxScale={3}
        wheel={{ step: 1 }}
        doubleClick={{ disabled: false }}
      >
        <Controls />
        <TransformComponent>
            <div className="w-full h-full z-20 ">
                {children}
            </div>
        </TransformComponent>
      </TransformWrapper>
    );
};

export default ZoomContainer;