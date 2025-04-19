import { useReducer, useRef, useEffect } from 'react';
import reducer, { initialState } from './reducer';
import { types } from './actions';

const usePanAndZoom = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const containerRef = useRef(null);

  const handleMouseUp = () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    dispatch({ type: types.PAN, clientX: e.clientX, clientY: e.clientY });
  };

  const onMouseDown = (e) => {
    dispatch({ type: types.PAN_START, clientX: e.clientX, clientY: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const onWheel = (e) => {
    if (!containerRef.current) return;
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    dispatch({
      type: types.ZOOM,
      zoomFactor: factor,
      clientX: e.clientX,
      clientY: e.clientY,
      containerRect: containerRef.current.getBoundingClientRect(),
    });
  };

  const zoomTo = (clientX, clientY, zoomFactor) => {
    if (!containerRef.current) return;
    dispatch({
      type: types.ZOOM,
      zoomFactor,
      clientX,
      clientY,
      containerRect: containerRef.current.getBoundingClientRect(),
    });
  };

  return {
    ...state,
    containerRef,
    onMouseDown,
    onWheel,
    zoomTo,
  };
};

export default usePanAndZoom;