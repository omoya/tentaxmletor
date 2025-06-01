import { useState } from "react";
import {
  Upload,
  CheckCircle,
  AlertCircle,
  Files,
  FileText,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import mammoth from "mammoth";
import JSZip from "jszip";

type ConversionStage = "idle" | "converting" | "complete" | "error";

const STAGE_PROGRESS: Record<ConversionStage, number> = {
  idle: 0,
  converting: 50,
  complete: 100,
  error: 0,
};

export function FileUpload() {
  const [stage, setStage] = useState<ConversionStage>("idle");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [processedFiles, setProcessedFiles] = useState<string[]>([]);
  const { toast } = useToast();

  const generateXMLForIOS = (
    paragraphs: NodeListOf<Element>,
    title: string,
    author: string
  ) => {
    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xmlContent += `<relato>\n`;
    xmlContent += `  <datos titulo="${paragraphs[0].innerHTML}" autor="${paragraphs[1].innerHTML}"></datos>\n`;

    //Start marking paragraphs as free
    let gratis = 1;

    paragraphs.forEach((p, index) => {
      if (index < 2) return; // Skip the first two paragraphs (title and author)
      let text = p.innerHTML;
      // Remove double spaces
      text = text.replace(/\s+/g, " ");
      // Remove strong tags
      text = text.replace(/<\/?strong>/g, "");
      // Replace <i> and <em> tags with iOS format
      text = text.replace(/<(i|em)>(.*?)<\/(i|em)>/g, " *C* $2 *C* ");

      // Check if the text contains "GGG" and remove it
      //if end of free text mark occurs, remove it and change the free paragraph to false
      // This is a placeholder for the actual logic to determine if the paragraph is free
      if (text.includes("***")) {
        text = text.replace("***", "");
        gratis = 0;
      }

      //Handle images (img nombre_imagen bloque)
      const regex = /^img\s+(.+?)\s+(.+?)$/;
      const match = text.match(regex);

      if (match) {
        xmlContent += `  <parrafo just="c" cap="0" saltolinea="2" sangria="0" font="imagen" size="0" gratis="${gratis.toString()}" img="${
          match[1]
        }" bloque="${match[2]}"></parrafo>\n`;
      }

      // Handle empty paragraphs
      else if (text.trim() === "[[EMPTY_PARAGRAPH]]") {
        xmlContent += `  <parrafo just="i" cap="0" saltolinea="0" sangria="1" font="basica" size="0" gratis="${gratis.toString()}" img="0" bloque=" *C* "></parrafo>\n`;
      }
      // Handle normal text
      else {
        const segment = text.trim();
        if (segment !== "") {
          xmlContent += `  <parrafo just="i" cap="0" saltolinea="0" sangria="1" font="basica" size="0" gratis="${gratis.toString()}" img="0" bloque="${segment}"></parrafo>\n`;
        }
      }
    });

    xmlContent += "</relato>";
    return xmlContent;
  };

  const generateXMLForAndroid = (
    paragraphs: NodeListOf<Element>,
    title: string,
    author: string
  ) => {
    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xmlContent += `<relato titulo="${title}" autor="${author}">\n`;
    //Start marking paragraphs as free
    let gratis = 1;

    paragraphs.forEach((p, index) => {
      if (index < 2) return; // Skip the first two paragraphs (title and author)
      let text = p.innerHTML;
      // Remove double spaces
      text = text.replace(/\s+/g, " ");
      // Remove strong tags
      text = text.replace(/<\/?strong>/g, "");
      // Replace <i> and <em> tags with Android format
      text = text.replace(/<(i|em)>(.*?)<\/(i|em)>/g, "*C*$2*C*");

      //if end of free text mark occurs, remove it and change the free paragraph to false
      if (text.includes("***")) {
        text = text.replace("***", "");
        gratis = 0;
      }

      const regex = /^img\s+(.+?)\s+(.+?)$/;
      const match = text.match(regex);

      //Handle images (img nombre_imagen bloque)
      if (match) {
        xmlContent += "  <parrafo> ";
        xmlContent += "<just>c</just> ";
        xmlContent += "<cap>0</cap> ";
        xmlContent += "<saltolinea>2</saltolinea> ";
        xmlContent += "<sangria>0</sangria> ";
        xmlContent += "<font>imagen</font> ";
        xmlContent += "<size>0</size> ";
        xmlContent += `<gratis>${gratis}</gratis> `;
        xmlContent += `<img>${match[1]}</img> `;
        xmlContent += `<bloque>${match[2]}</bloque> `;
        xmlContent += "</parrafo>\n>";
      }

      // Handle empty paragraphs and normal text
      else if (text.trim() === "[[EMPTY_PARAGRAPH]]") {
        xmlContent += "  <parrafo> ";
        xmlContent += "<just>i</just> ";
        xmlContent += "<cap>0</cap> ";
        xmlContent += "<saltolinea>0</saltolinea> ";
        xmlContent += "<sangria>0</sangria> ";
        xmlContent += "<font>basica</font> ";
        xmlContent += "<size>0</size> ";
        xmlContent += `<gratis>${gratis}</gratis> `;
        xmlContent += "<img>0</img> ";
        xmlContent += "<bloque> *SL* </bloque> ";
        xmlContent += "</parrafo>\n>";
      } else {
        const segment = text.trim();
        if (segment !== "") {
          xmlContent += "  <parrafo> ";
          xmlContent += "<just>i</just> ";
          xmlContent += "<cap>0</cap> ";
          xmlContent += "<saltolinea>0</saltolinea> ";
          xmlContent += "<sangria>0</sangria> ";
          xmlContent += "<font>basica</font> ";
          xmlContent += "<size>0</size> ";
          xmlContent += `<gratis>${gratis}</gratis> `;
          xmlContent += "<img>0</img> ";
          xmlContent += `<bloque>${segment}</bloque> `;
          xmlContent += "</parrafo>\n>";
        }
      }
    });

    xmlContent += "</relato>";
    return xmlContent;
  };

  const parseFileName = (fileName: string) => {
    const match = fileName.match(/^(.+)--(.+)\.docx$/);
    if (match) {
      return {
        title: match[1],
        author: match[2],
      };
    }
    return null;
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const parsed = parseFileName(file.name);
    const originalFileName = file.name.replace(/\.[^/.]+$/, ""); // Remove the file extension
    if (parsed) {
      setTitle(parsed.title);
      setAuthor(parsed.author);
    }

    try {
      setStage("converting");

      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const parser = new DOMParser();
      const doc = parser.parseFromString(result.value, "text/html");
      const paragraphs = doc.querySelectorAll("p");

      const iosXML = generateXMLForIOS(
        paragraphs,
        parsed?.title || title,
        parsed?.author || author
      );
      const androidXML = generateXMLForAndroid(
        paragraphs,
        parsed?.title || title,
        parsed?.author || author
      );

      // Create a ZIP file
      const zip = new JSZip();
      zip.file(`ios_${originalFileName}.xml`, iosXML);
      zip.file(`android_${originalFileName}.xml`, androidXML);

      // Generate the ZIP file and trigger download
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipUrl = window.URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = zipUrl;
      a.download = `converted_files_${originalFileName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(zipUrl);

      setStage("complete");
      toast({
        title: "¡Éxito!",
        description: `Sus archivos XML han sido generados y descargados en un archivo ZIP.`,
      });
    } catch (error) {
      setStage("error");
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to convert file",
        variant: "destructive",
      });
    }
  };
  const handleMultipleFilesChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setStage("converting");
      setProcessedFiles([]);
      const fileNames: string[] = [];

      const zip = new JSZip();

      for (const file of Array.from(files)) {
        const originalFileName = file.name.replace(/\.[^/.]+$/, ""); // Remove the file extension
        const parsed = parseFileName(file.name); // Parse the file name for title and author
        fileNames.push(originalFileName);

        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const parser = new DOMParser();
        const doc = parser.parseFromString(result.value, "text/html");
        const paragraphs = doc.querySelectorAll("p");

        const iosXML = generateXMLForIOS(
          paragraphs,
          parsed?.title || originalFileName, // Use parsed title or fallback to file name
          parsed?.author || "" // Use parsed author or fallback to empty string
        );
        const androidXML = generateXMLForAndroid(
          paragraphs,
          parsed?.title || originalFileName,
          parsed?.author || ""
        );

        zip.file(`ios_${originalFileName}.xml`, iosXML);
        zip.file(`android_${originalFileName}.xml`, androidXML);

        // Update processed files array
        setProcessedFiles((prev) => [...prev, originalFileName]);
      }

      // Generate the ZIP file and trigger download
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipUrl = window.URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = zipUrl;
      a.download =
        files.length === 1
          ? `converted_files_${fileNames[0]}.zip`
          : `converted_files_${new Date().toISOString().split("T")[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(zipUrl);

      setStage("complete");
      toast({
        title: "¡Éxito!",
        description: `${files.length} ${
          files.length === 1 ? "archivo convertido" : "archivos convertidos"
        } y descargados en un archivo ZIP.`,
      });
    } catch (error) {
      setStage("error");
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to convert files",
        variant: "destructive",
      });
    }
  };

  const handleDrop = async (files: FileList) => {
    if (!files || files.length === 0) return;

    if (files.length === 1) {
      // Single file upload
      const event = {
        target: { files },
        currentTarget: { files },
        preventDefault: () => {},
        stopPropagation: () => {},
        nativeEvent: {} as Event,
        bubbles: false,
        cancelable: false,
        defaultPrevented: false,
        eventPhase: 0,
        isTrusted: true,
        timeStamp: Date.now(),
        type: "change",
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      await handleFileChange(event);
    } else {
      // Multiple file upload
      const event = {
        target: { files },
        currentTarget: { files },
        preventDefault: () => {},
        stopPropagation: () => {},
        nativeEvent: {} as Event,
        bubbles: false,
        cancelable: false,
        defaultPrevented: false,
        eventPhase: 0,
        isTrusted: true,
        timeStamp: Date.now(),
        type: "change",
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      await handleMultipleFilesChange(event);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDropEvent = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    handleDrop(files);
  };

  const getStageMessage = (stage: ConversionStage) => {
    const messages: Record<ConversionStage, string> = {
      idle: "Listo para convertir",
      converting: "Convirtiendo archivo...",
      complete: "¡Conversión completada!",
      error: "Error en la conversión",
    };
    return messages[stage];
  };
  return (
    <div className="space-y-8">
      {/* Multiple File Upload Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-2xl transition-all duration-300 ease-in-out ${
          stage === "converting" ? "opacity-60 pointer-events-none" : ""
        } ${
          stage === "idle"
            ? "hover:border-blue-400 hover:bg-blue-50/50 border-blue-200 dark:hover:border-blue-600 dark:hover:bg-blue-900/10 dark:border-blue-900/30"
            : stage === "complete"
            ? "border-green-300 bg-green-50/50 dark:border-green-900/30 dark:bg-green-900/10"
            : stage === "error"
            ? "border-red-300 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10"
            : "border-gray-200 dark:border-gray-700"
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDropEvent}
      >
        <label
          htmlFor="multi-file-upload"
          className="flex flex-col items-center justify-center space-y-6 text-center cursor-pointer p-10"
        >
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center ${
              stage === "idle"
                ? "bg-blue-100 dark:bg-blue-900/30"
                : stage === "converting"
                ? "bg-amber-100 dark:bg-amber-900/30"
                : stage === "complete"
                ? "bg-green-100 dark:bg-green-900/30"
                : "bg-red-100 dark:bg-red-900/30"
            }`}
          >
            {stage === "idle" && (
              <Files className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            )}
            {stage === "converting" && (
              <Loader2 className="w-10 h-10 text-amber-600 dark:text-amber-400 animate-spin" />
            )}
            {stage === "complete" && (
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            )}
            {stage === "error" && (
              <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            )}
          </div>

          <div className="space-y-2">
            <span
              className={`text-lg font-medium block ${
                stage === "idle"
                  ? "text-gray-800 dark:text-gray-200"
                  : stage === "converting"
                  ? "text-amber-700 dark:text-amber-400"
                  : stage === "complete"
                  ? "text-green-700 dark:text-green-400"
                  : "text-red-700 dark:text-red-400"
              }`}
            >
              {stage === "idle" &&
                "Arrastra y suelta o haz clic para seleccionar"}
              {stage === "converting" && "Procesando archivos..."}
              {stage === "complete" && "¡Conversión completada!"}
              {stage === "error" && "Error en la conversión"}
            </span>

            {stage === "idle" && (
              <>
                <span className="text-sm text-blue-600 font-medium dark:text-blue-400">
                  archivos .docx
                </span>
                <p className="text-sm text-gray-500 max-w-md mx-auto mt-2 dark:text-gray-400">
                  Puedes subir varios archivos .docx para convertirlos. El
                  título y autor se extraerán del nombre del archivo si sigue el
                  formato: <strong>titulo -- autor.docx</strong>
                </p>
              </>
            )}

            {stage === "complete" && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Haz clic para procesar más archivos
              </p>
            )}

            {stage === "error" && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Inténtalo de nuevo con otros archivos
              </p>
            )}
          </div>
        </label>
        <input
          type="file"
          accept=".docx"
          multiple
          onChange={handleMultipleFilesChange}
          className="hidden"
          id="multi-file-upload"
          disabled={stage === "converting"}
        />
      </div>

      {stage === "converting" && processedFiles.length > 0 && (
        <div className="space-y-3 bg-white p-6 rounded-xl border border-gray-100 shadow-sm dark:bg-slate-800 dark:border-slate-700">
          <div className="flex justify-between text-sm font-medium mb-1">
            <span className="text-amber-600 dark:text-amber-400">
              Procesando archivos...
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {processedFiles.length}{" "}
              {processedFiles.length === 1 ? "archivo" : "archivos"} procesados
            </span>
          </div>
          <Progress
            value={STAGE_PROGRESS[stage]}
            className="h-2 bg-amber-100 dark:bg-amber-900/30"
          />

          <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
            {processedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300"
              >
                <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span>{file}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stage === "complete" && (
        <div className="flex items-center p-6 bg-green-50 text-green-700 rounded-xl border border-green-100 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-400">
          <div className="mr-4 flex-shrink-0">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-medium text-lg">¡Conversión completada!</h3>
            <p className="text-sm mt-1">
              Se ha generado y descargado un archivo ZIP con todos los XMLs
              convertidos.
              {processedFiles.length > 0 &&
                ` Se procesaron ${processedFiles.length} archivos.`}
            </p>
          </div>
        </div>
      )}

      {stage === "error" && (
        <div className="flex items-center p-6 bg-red-50 text-red-700 rounded-xl border border-red-100 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400">
          <div className="mr-4 flex-shrink-0">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-medium text-lg">Error en la conversión</h3>
            <p className="text-sm mt-1">
              Ha ocurrido un error al procesar los archivos. Por favor,
              comprueba que los archivos son válidos e inténtalo de nuevo.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
