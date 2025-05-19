import { useState } from "react";
import { Upload, CheckCircle, AlertCircle, Files } from "lucide-react";
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

      const zip = new JSZip();

      for (const file of Array.from(files)) {
        const originalFileName = file.name.replace(/\.[^/.]+$/, ""); // Remove the file extension
        const parsed = parseFileName(file.name); // Parse the file name for title and author

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
      }

      // Generate the ZIP file and trigger download
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipUrl = window.URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = zipUrl;
      a.download = `converted_files.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(zipUrl);

      setStage("complete");
      toast({
        title: "¡Éxito!",
        description: `Los archivos XML han sido generados y descargados en un archivo ZIP.`,
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
    <div className="space-y-6">
      {/* Multiple File Upload Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 transition-colors duration-200 ease-in-out ${
          stage === "converting" ? "opacity-50" : ""
        } hover:border-primary hover:bg-primary/5`}
        onDragOver={handleDragOver}
        onDrop={handleDropEvent}
      >
        <label
          htmlFor="multi-file-upload"
          className="flex flex-col items-center justify-center space-y-4 text-center cursor-pointer"
        >
          <Files className="w-12 h-12 text-muted-foreground" />{" "}
          {/* Use the Files icon */}
          <span className="text-sm font-medium">
            Arrastra y suelta o haz clic para seleccionar varios archivos .docx
          </span>
          <p className="text-sm text-gray-500">
            Puedes subir varios archivos .docx para convertirlos. El número de
            párrafos gratis se aplicará a todos los archivos.
          </p>
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

      {stage !== "idle" && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>{getStageMessage(stage)}</span>
            <span>{STAGE_PROGRESS[stage]}%</span>
          </div>
          <Progress value={STAGE_PROGRESS[stage]} className="h-2" />
        </div>
      )}

      {stage === "complete" && (
        <div className="flex items-center justify-center gap-2 text-sm text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span>¡Conversión completada!</span>
        </div>
      )}

      {stage === "error" && (
        <div className="flex items-center justify-center gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" />
          <span>Error en la conversión</span>
        </div>
      )}
    </div>
  );
}
