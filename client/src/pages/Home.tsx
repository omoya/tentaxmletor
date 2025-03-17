import { useState, Fragment } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileUpload } from "@/components/FileUpload";
import { Dialog, Transition } from "@headlessui/react";
import InfoIcon from "@mui/icons-material/Info";
import { TextField } from "@mui/material";

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
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
            Formatacle
          </h1>
          <p className="text-muted-foreground">
            Sube un archivo .docx para convertirlo a documentos XML.
          </p>
          <button onClick={openModal} className="text-muted-foreground">
            <InfoIcon className="w-6 h-6 inline-block" />
          </button>
        </div>

        <Card>
          <CardContent className="p-6">
            <FileUpload />
          </CardContent>
        </Card>
      </div>

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
                      • Sube un archivo docx en el que hayas puesto en cursiva
                      los textos que te interese resaltar.
                    </p>
                    <p className="text-sm text-gray-500">
                      • El nombre del autor y título del relato se extraen
                      automáticamente del nombre del archivo si sigue este
                      formato: titulo -- autor.docx.
                    </p>
                    <p className="text-sm text-gray-500">
                      • Indica el número de párrafos que se marcaran como de
                      acceso libre.
                    </p>
                    <p className="text-sm text-gray-500">
                      • Se descargarán automáticamente dos XMLs, uno con el
                      formato para iOS, otro el de Android.
                    </p>
                  </div>

                  <div className="mt-4">
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
