import { AlertCircle } from "lucide-react"; // Import the icon from Lucide

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <>
      <main className="h-screen bg-gray-50 flex items-center justify-center p-12">
        <div className="bg-white border border-gray-100 rounded-lg p-12 max-w-2xl text-center">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>

          {/* Heading */}
          <h1 className="mb-4">Ocurrio un Error 🧐</h1>

          {/* Error Message */}
          <p className="font-sono text-gray-500 mb-8">{error.message}</p>

          {/* Button */}
          <button size="large" onClick={resetErrorBoundary}>
            Refrescar
          </button>
        </div>
      </main>
    </>
  );
}

export default ErrorFallback;
