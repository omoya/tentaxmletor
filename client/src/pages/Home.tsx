import { useState, Fragment } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileUpload } from "@/components/FileUpload";
import { Dialog, Transition } from "@headlessui/react";
import InfoIcon from "@mui/icons-material/Info";
import { CodeBracketSquareIcon } from "@heroicons/react/24/outline"; // Import an XML-like icon

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  function closeModal() {
    setIsModalOpen(false);
  }

  function openModal() {
    setIsModalOpen(true);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-2xl mx-auto">
        {/* Title Section */}
        <div className="mb-4 text-center">
          <div className="flex items-center justify-center space-x-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Tentaxmletor
            </h1>
            <CodeBracketSquareIcon className="w-12 h-12 text-primary" />
          </div>
          {/* Information Icon */}
          <div className="mt-2">
            <button
              onClick={openModal}
              className="inline-flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700"
            >
              <InfoIcon className="w-5 h-5" />
              <span>¿Cómo funciona?</span>
            </button>
          </div>
        </div>

        {/* File Upload Section */}
        <Card>
          <CardContent className="p-6">
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
            <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Instrucciones
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      • <b>Edíta en Word</b> los relatos a formatear teniendo en
                      cuenta las siguientes instrucciones.
                    </p>

                    <br />
                    <p className="text-sm text-gray-500">
                      • El <b>título y el autor</b> se extraen automáticamente
                      del primer y segundo párrafo respectivamente.
                    </p>

                    <br />
                    <p className="text-sm text-gray-500">
                      • Marca en cursiva los textos que quieras destacar.
                    </p>

                    <br />
                    <p className="text-sm text-gray-500">
                      • Incluye <b>***</b> (tres asteriscos) en el primer
                      párrafo de contenido exclusivo para subscriptores que
                      tenga el relato. Los párrafos anteriores se marcarán
                      automáticamente como gratis al convertir el archivo a XML.
                    </p>

                    <br />
                    <p className="text-sm text-gray-500">
                      • incluye un párrafo con el texto{" "}
                      <b>img nombre_imagen bloque</b> para cada imagen que
                      quieras incluir en el relato. P.ej. img filigrana01-f-0-0
                      IMG010
                    </p>

                    <br />
                    <p className="text-sm text-gray-500">
                      • Sube uno o varios archivos .docx editados para
                      convertirlos a documentos XML. Automáticamente se
                      descargará un archivo ZIP que contiene los documentos XML
                      generados. Para cada archivo subido, se generarán dos
                      XMLs: uno con el formato para iOS y otro con el formato
                      para Android.
                    </p>
                  </div>

                  <div className="mt-4 text-right">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
