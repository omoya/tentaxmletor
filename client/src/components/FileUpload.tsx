import { useState } from "react";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import mammoth from "mammoth";
import { TextField } from "@mui/material";

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
  const [freeParagraphs, setFreeParagraphs] = useState(5);
  const { toast } = useToast();

  const generateXMLForIOS = (
    paragraphs: NodeListOf<Element>,
    title: string,
    author: string
  ) => {
    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xmlContent += `<relato>\n`;
    xmlContent += `  <datos titulo="${title}" autor="${author}"></datos>\n`;

    paragraphs.forEach((p, index) => {
      let text = p.innerHTML;
      // Remove strong tags
      text = text.replace(/<\/?strong>/g, "");
      // Replace <i> and <em> tags with iOS format
      text = text.replace(/<(i|em)>(.*?)<\/(i|em)>/g, " *C* $2 *C* ");

      // Handle empty paragraphs and normal text
      if (text.trim() === "[[EMPTY_PARAGRAPH]]") {
        xmlContent +=
          '  <parrafo just="i" cap="0" saltolinea="0" sangria="1" font="basica" size="0" gratis="1" img="0" bloque=" *C* "></parrafo>\n';
      } else {
        const segment = text.trim();
        if (segment !== "") {
          xmlContent += `  <parrafo just="i" cap="0" saltolinea="0" sangria="1" font="basica" size="0" gratis="${
            index < freeParagraphs ? 1 : 0
          }" img="0" bloque="${segment}"></parrafo>\n`;
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

    paragraphs.forEach((p, index) => {
      let text = p.innerHTML;
      // Remove strong tags
      text = text.replace(/<\/?strong>/g, "");
      // Replace <i> and <em> tags with Android format
      text = text.replace(/<(i|em)>(.*?)<\/(i|em)>/g, "*C*$2*C*");

      // Handle empty paragraphs and normal text
      if (text.trim() === "[[EMPTY_PARAGRAPH]]") {
        xmlContent += "  <parrafo> ";
        xmlContent += "    <just>i</just> ";
        xmlContent += "    <cap>0</cap> ";
        xmlContent += "    <saltolinea>0</saltolinea> ";
        xmlContent += "    <sangria>0</sangria> ";
        xmlContent += "    <font>basica</font> ";
        xmlContent += "    <size>0</size> ";
        xmlContent += "    <gratis>0</gratis> ";
        xmlContent += "    <img>0</img> ";
        xmlContent += "    <bloque> *SL* </bloque> ";
        xmlContent += "  </parrafo>\n";
      } else {
        const segment = text.trim();
        if (segment !== "") {
          xmlContent += "  <parrafo> ";
          xmlContent += "    <just>i</just> ";
          xmlContent += "    <cap>0</cap> ";
          xmlContent += "    <saltolinea>0</saltolinea> ";
          xmlContent += "    <sangria>0</sangria> ";
          xmlContent += "    <font>basica</font> ";
          xmlContent += "    <size>0</size> ";
          xmlContent += `    <gratis="${index < freeParagraphs ? 1 : 0}" `;
          xmlContent += "    <img>0</img> ";
          xmlContent += `    <bloque>${segment}</bloque> `;
          xmlContent += "  </parrafo>\n";
        }
      }
    });

    xmlContent += "</relato>";
    return xmlContent;
  };

  const downloadXML = (xmlContent: string, platform: string) => {
    const blob = new Blob([xmlContent], { type: "application/xml" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted_${platform.toLowerCase()}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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

      downloadXML(iosXML, "iOS");
      setTimeout(() => {
        downloadXML(androidXML, "Android");
      }, 500);

      setStage("complete");
      toast({
        title: "¡Éxito!",
        description:
          "Sus archivos XML han sido generados y descargados para iOS y Android.",
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
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            placeholder="Introduce el título del documento"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="author">Autor</Label>
          <Input
            id="author"
            placeholder="Introduce el nombre del autor"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>
        <div className="mt-4">
          <TextField
            type="number"
            label="Número de párrafos gratis"
            value={freeParagraphs}
            onChange={(e) => setFreeParagraphs(Number(e.target.value))}
            fullWidth
            inputProps={{ min: 1, max: 10 }}
          />
        </div>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 transition-colors duration-200 ease-in-out ${
          stage === "converting" ? "opacity-50" : ""
        } hover:border-primary hover:bg-primary/5`}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const file = e.dataTransfer.files[0];
          if (file && file.name.endsWith(".docx")) {
            const event = {
              target: { files: [file] },
              currentTarget: { files: [file] },
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
            toast({
              title: "Error",
              description: "Por favor, sube solo archivos .docx",
              variant: "destructive",
            });
          }
        }}
      >
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center space-y-4 text-center cursor-pointer"
        >
          <Upload className="w-12 h-12 text-muted-foreground" />
          <span className="text-sm font-medium">
            Arrastra y suelta o haz clic para seleccionar un archivo .docx
          </span>
          <input
            type="file"
            accept=".docx"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            disabled={stage === "converting"}
          />
        </label>
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
