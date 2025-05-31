import { useState, Fragment } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileUpload } from "@/components/FileUpload";
import { Dialog, Transition } from "@headlessui/react";
import InfoIcon from "@mui/icons-material/Info";
import { CodeBracketSquareIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  function closeModal() {
    setIsModalOpen(false);
  }

  function openModal() {
    setIsModalOpen(true);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-2xl mx-auto">
        {/* Title Section */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center space-x-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
              Tentaxmletor
            </h1>
            <CodeBracketSquareIcon className="w-12 h-12 text-blue-600" />
          </div>
          {/* Information Icon */}
          <div className="mt-3">
            <button
              onClick={openModal}
              className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 border border-gray-200 rounded-full px-4 py-1.5 hover:border-blue-300 hover:bg-blue-50 dark:text-gray-300 dark:border-gray-700 dark:hover:text-blue-400 dark:hover:border-blue-900 dark:hover:bg-blue-900/20"
            >
              <InfoIcon className="w-4 h-4" />
              <span>¿Cómo funciona?</span>
            </button>
          </div>
        </div>

        {/* File Upload Section */}
        <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
          <CardContent className="p-8">
            <FileUpload />
          </CardContent>
        </Card>
      </div>

      {/* Modal Section */}
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
            <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm" />
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all border border-gray-100">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-semibold leading-6 text-gray-900 mb-4"
                  >
                    Instrucciones
                  </Dialog.Title>
                  <div className="mt-2 space-y-4">
                    <p className="text-sm text-gray-600">
                      • <b>Edíta en Word</b> los relatos a formatear teniendo en
                      cuenta las siguientes instrucciones.
                    </p>

                    <p className="text-sm text-gray-600">
                      • El <b>título y el autor</b> se extraen automáticamente
                      del primer y segundo párrafo respectivamente.
                    </p>

                    <p className="text-sm text-gray-600">
                      • Marca en <i>cursiva</i> los textos que quieras destacar.
                    </p>

                    <p className="text-sm text-gray-600">
                      • Incluye <b>***</b> (tres asteriscos) en el primer
                      párrafo de contenido exclusivo para subscriptores que
                      tenga el relato. Los párrafos anteriores se marcarán
                      automáticamente como gratis al convertir el archivo a XML.
                    </p>

                    <p className="text-sm text-gray-600">
                      • Incluye un párrafo con el texto{" "}
                      <code className="bg-gray-100 p-1 rounded text-sm">
                        img nombre_imagen bloque
                      </code>{" "}
                      para cada imagen que quieras añadir al relato. P.ej.{" "}
                      <code className="bg-gray-100 p-1 rounded text-sm">
                        img filigrana01-f-0-0 IMG010
                      </code>
                    </p>

                    <p className="text-sm text-gray-600">
                      • Sube uno o varios archivos .docx editados para
                      convertirlos a documentos XML. Automáticamente se
                      descargará un archivo ZIP que contiene los documentos XML
                      generados. Para cada archivo subido, se generarán dos
                      XMLs: uno con el formato para iOS y otro con el formato
                      para Android.
                    </p>
                  </div>

                  <div className="mt-6 text-right">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-200"
                      onClick={closeModal}
                    >
                      Cerrar
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
