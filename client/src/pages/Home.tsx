import { useState, Fragment } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileUpload } from "@/components/FileUpload";
import { Dialog, Transition } from "@headlessui/react";
import {
  CodeBracketSquareIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  function closeModal() {
    setIsModalOpen(false);
  }

  function openModal() {
    setIsModalOpen(true);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/30">
      {/* Header/Navigation Bar */}
      <header className="absolute top-0 left-0 right-0 py-4 px-6 flex justify-between items-center bg-white/80 backdrop-blur-sm border-b border-gray-100 z-10 dark:bg-slate-900/80 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <CodeBracketSquareIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span className="text-lg font-semibold text-gray-800 dark:text-white">
            Tentaxmletor
          </span>
        </div>
        <button
          onClick={openModal}
          className="inline-flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
        >
          <InformationCircleIcon className="w-5 h-5" />
          <span>Instrucciones</span>
        </button>
      </header>

      <div className="max-w-4xl mx-auto pt-16">
        {/* Hero Section */}
        <div className="mb-12 text-center py-16">
          <div className="inline-block mb-4 px-6 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-medium dark:bg-blue-900/40 dark:text-blue-300">
            Conversión DOCX a XML
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm mb-6">
            Tentaxmletor
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 dark:text-gray-300">
            Conversor de documentos Word a XML para plataformas iOS y Android
            con soporte para múltiples archivos.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-100 dark:bg-slate-800 dark:border-slate-700">
              <DocumentTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-gray-700 dark:text-gray-200">
                Archivos .docx
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-100 dark:bg-slate-800 dark:border-slate-700">
              <ArrowPathIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-gray-700 dark:text-gray-200">
                Conversión instantánea
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-100 dark:bg-slate-800 dark:border-slate-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-blue-600 dark:text-blue-400"
              >
                <path d="M20.9 18.55l-8-15.98a1 1 0 0 0-1.8 0l-8 15.98a1 1 0 0 0 .9 1.45h16a1 1 0 0 0 .9-1.45" />
              </svg>
              <span className="text-gray-700 dark:text-gray-200">
                Formato iOS/Android
              </span>
            </div>
          </div>
        </div>

        {/* File Upload Section */}
        <Card className="shadow-xl border-0 rounded-2xl overflow-hidden backdrop-blur-sm bg-white/90 dark:bg-slate-800/90 dark:border-slate-700">
          <CardContent className="p-10">
            <FileUpload />
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto mt-16 text-center text-sm text-gray-500 dark:text-gray-400 pb-8">
        <p>
          Desarrollado con la ayuda de 🐙 para facilitar el trabajo de edición y
          formato
        </p>
        <p className="mt-2">
          © {new Date().getFullYear()} Tentaxmletor - Todos los derechos
          reservados
        </p>
      </footer>

      {/* Instructions Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all border border-gray-100 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-900/30">
                      <InformationCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <Dialog.Title
                      as="h3"
                      className="text-xl font-semibold leading-6 text-gray-900 dark:text-white"
                    >
                      Instrucciones de Uso
                    </Dialog.Title>
                  </div>

                  <div className="mt-4 space-y-5">
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30">
                      <h4 className="font-medium text-blue-800 mb-2 dark:text-blue-300">
                        Preparación del documento en Word
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        • <b>Formato del documento:</b> Asegúrate de que el
                        primer párrafo sea el título y el segundo párrafo sea el
                        autor.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        • Marca en <i>cursiva</i> los textos que quieras
                        destacar. Estos se convertirán automáticamente al
                        formato correcto.
                      </p>

                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        • Incluye <b>***</b> (tres asteriscos) en el primer
                        párrafo de contenido exclusivo para subscriptores. Los
                        párrafos anteriores se marcarán automáticamente como
                        gratis al convertir el archivo a XML.
                      </p>

                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        • Para incluir imágenes, añade un párrafo con el
                        formato:{" "}
                        <code className="bg-gray-100 p-1 rounded text-sm dark:bg-gray-700 dark:text-gray-200">
                          img nombre_imagen bloque
                        </code>
                      </p>

                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        • Ejemplo:{" "}
                        <code className="bg-gray-100 p-1 rounded text-sm dark:bg-gray-700 dark:text-gray-200">
                          img filigrana01-f-0-0 IMG010
                        </code>
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-green-50 border border-green-100 dark:bg-green-900/20 dark:border-green-900/30">
                      <h4 className="font-medium text-green-800 mb-2 dark:text-green-300">
                        Proceso de conversión
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        • Sube uno o varios archivos .docx para convertirlos a
                        documentos XML. Para cada archivo, se generarán dos
                        XMLs: uno con formato para iOS y otro para Android.
                      </p>
                      <p className="text-sm text-gray-700 mt-2 dark:text-gray-300">
                        • Automáticamente se descargará un archivo ZIP que
                        contiene todos los documentos XML generados.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 text-right">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-200 shadow-sm"
                      onClick={closeModal}
                    >
                      Entendido
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
