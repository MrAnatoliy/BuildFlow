import { useEffect } from 'react';

export function OfflinePage({ message }) {
  useEffect(() => {
    const timer = setTimeout(() => window.location.reload(), 15000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="text-5xl mb-4">🔌</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{message}</h2>
        <p className="text-gray-600 mb-6">Попытка переподключения...</p>
        <div className="animate-pulse mb-6">
          <div className="h-2 bg-blue-200 rounded w-full"></div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Попробовать снова
        </button>
      </div>
    </div>
  );
}