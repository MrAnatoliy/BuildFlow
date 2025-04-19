// Импорт типов действий из файла actions
import { types } from './actions';

// Начальное состояние хранилища
export const initialState = {
  translateX: 0,  // Сдвиг по оси X
  translateY: 0,  // Сдвиг по оси Y
  prevMouseX: 0,  // Предыдущая позиция курсора по X
  prevMouseY: 0,  // Предыдущая позиция курсора по Y
  scale: 0.20,       // Масштаб (по умолчанию 1)
  minScale: 0.1,    // Минимальный масштаб (10%)
  maxScale: 3.0,    // Максимальный масштаб (300%)
};

const reducer = (state, action) => {
  switch (action.type) {
    case types.PAN_START:
      return {
        ...state,  // Копируем текущее состояние
        prevMouseX: action.clientX,  // Запоминаем текущую позицию X курсора
        prevMouseY: action.clientY,  // Запоминаем текущую позицию Y курсора
      };

    // Обработка перемещения (панорамирования)
    case types.PAN:
      // Вычисляем разницу между текущей и предыдущей позицией курсора
      const dx = action.clientX - state.prevMouseX;
      const dy = action.clientY - state.prevMouseY;
      return {
        ...state,  // Копируем текущее состояние
        translateX: state.translateX + dx,  // Обновляем сдвиг по X
        translateY: state.translateY + dy,  // Обновляем сдвиг по Y
        prevMouseX: action.clientX,         // Обновляем предыдущую позицию X
        prevMouseY: action.clientY,         // Обновляем предыдущую позицию Y
      };

    // Обработка масштабирования (зума)
    case types.ZOOM:
      // Извлекаем текущие значения из состояния
      const { minScale, maxScale, scale, translateX, translateY } = state;
      // Получаем коэффициент масштабирования из действия
      const zoomFactor = action.zoomFactor;
      // Вычисляем новый масштаб
      const newScale = Math.max(minScale, Math.min(maxScale, scale * zoomFactor));


      
      // Вычисляем позицию курсора относительно контейнера
      const containerX = action.clientX - action.containerRect.left;
      const containerY = action.clientY - action.containerRect.top;

      // Вычисляем позицию курсора в системе координат содержимого (до масштабирования)
      const mouseX = (containerX - translateX) / scale;
      const mouseY = (containerY - translateY) / scale;

      // Возвращаем обновленное состояние
      return {
        ...state,
        scale: newScale,  // Обновляем масштаб
        // Корректируем сдвиг, чтобы масштабирование происходило относительно курсора
        translateX: containerX - mouseX * newScale,
        translateY: containerY - mouseY * newScale,
      };

    default:
      return state;
  }
};

export default reducer;