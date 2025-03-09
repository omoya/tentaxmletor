import { useState } from "react";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import mammoth from "mammoth";

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

  const generateXMLForIOS = (paragraphs: NodeListOf<Element>, title: string, author: string) => {
    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xmlContent += `<relato titulo="${title}" autor="${author}">\n`;

    paragraphs.forEach((p) => {
      let text = p.innerHTML;
      // Remove strong tags
      text = text.replace(/<\/?strong>/g, '');
      // Replace <i> and <em> tags with iOS format
      text = text.replace(/<(i|em)>(.*?)<\/(i|em)>/g, ' *SL* $2 *SL* ');

      // Handle empty paragraphs and normal text
      if (text.trim() === "[[EMPTY_PARAGRAPH]]") {
        xmlContent += '  <parrafo>\n';
        xmlContent += '    <just>i</just>\n';
        xmlContent += '    <cap>0</cap>\n';
        xmlContent += '    <saltolinea>0</saltolinea>\n';
        xmlContent += '    <sangria>0</sangria>\n';
        xmlContent += '    <font>basica</font>\n';
        xmlContent += '    <size>0</size>\n';
        xmlContent += '    <gratis>0</gratis>\n';
        xmlContent += '    <img>0</img>\n';
        xmlContent += '    <bloque> *SL* </bloque>\n';
        xmlContent += '  </parrafo>\n';
      } else {
        const segment = text.trim();
        if (segment !== '') {
          xmlContent += '  <parrafo>\n';
          xmlContent += '    <just>i</just>\n';
          xmlContent += '    <cap>0</cap>\n';
          xmlContent += '    <saltolinea>0</saltolinea>\n';
          xmlContent += '    <sangria>0</sangria>\n';
          xmlContent += '    <font>basica</font>\n';
          xmlContent += '    <size>0</size>\n';
          xmlContent += '    <gratis>0</gratis>\n';
          xmlContent += '    <img>0</img>\n';
          xmlContent += `    <bloque>${segment}</bloque>\n`;
          xmlContent += '  </parrafo>\n';
        }
      }
    });

    xmlContent += '</relato>';
    return xmlContent;
  };

  const generateXMLForAndroid = (paragraphs: NodeListOf<Element>, title: string, author: string) => {
    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xmlContent += `<relato titulo="${title}" autor="${author}">\n`;

    paragraphs.forEach((p) => {
      let text = p.innerHTML;
      // Remove strong tags
      text = text.replace(/<\/?strong>/g, '');
      // Replace <i> and <em> tags with Android format
      text = text.replace(/<(i|em)>(.*?)<\/(i|em)>/g, '*C*$2*C*');

      // Handle empty paragraphs and normal text
      if (text.trim() === "[[EMPTY_PARAGRAPH]]") {
        xmlContent += '  <parrafo>\n';
        xmlContent += '    <just>i</just>\n';
        xmlContent += '    <cap>0</cap>\n';
        xmlContent += '    <saltolinea>0</saltolinea>\n';
        xmlContent += '    <sangria>0</sangria>\n';
        xmlContent += '    <font>basica</font>\n';
        xmlContent += '    <size>0</size>\n';
        xmlContent += '    <gratis>0</gratis>\n';
        xmlContent += '    <img>0</img>\n';
        xmlContent += '    <bloque> *SL* </bloque>\n';
        xmlContent += '  </parrafo>\n';
      } else {
        const segment = text.trim();
        if (segment !== '') {
          xmlContent += '  <parrafo>\n';
          xmlContent += '    <just>i</just>\n';
          xmlContent += '    <cap>0</cap>\n';
          xmlContent += '    <saltolinea>0</saltolinea>\n';
          xmlContent += '    <sangria>0</sangria>\n';
          xmlContent += '    <font>basica</font>\n';
          xmlContent += '    <size>0</size>\n';
          xmlContent += '    <gratis>0</gratis>\n';
          xmlContent += '    <img>0</img>\n';
          xmlContent += `    <bloque>${segment}</bloque>\n`;
          xmlContent += '  </parrafo>\n';
        }
      }
    });

    xmlContent += '</relato>';
    return xmlContent;
  };

  const downloadXML = (xmlContent: string, platform: string) => {
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
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
        author: match[2]
      };
    }
    return null;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const parsed = parseFileName(file.name);
    if (parsed) {
      setTitle(parsed.title);
      setAuthor(parsed.author);
    }
    if (!file) return;

    try {
      setStage("converting");

      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ 
        arrayBuffer,
        styleMap: [
          "p[style-name='center'] => center",
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          "p[style-name='Heading 4'] => h4:fresh",
          "p[style-name='Heading 5'] => h5:fresh",
          "p[style-name='Heading 6'] => h6:fresh",
          "p:empty => p.empty-paragraph"
        ],
        ignoreEmptyParagraphs: false,
        preserveEmptyParagraphs: true,
        transformDocument: (element) => {
          if (element.type === "paragraph") {
            const isEmpty = !element.children?.length || 
                          element.children.every(child => 
                            !child.value || 
                            child.value.trim() === "" || 
                            child.value === "\u00A0" || 
                            child.value === "&nbsp;");
            
            if (isEmpty) {
              return { ...element, children: [{ type: "text", value: "[[EMPTY_PARAGRAPH]]" }] };
            }
          }
          return element;
        }
      });
      const parser = new DOMParser();
      const doc = parser.parseFromString(result.value, 'text/html');
      const paragraphs = doc.querySelectorAll('p');

      const iosXML = generateXMLForIOS(paragraphs, title, author);
      const androidXML = generateXMLForAndroid(paragraphs, title, author);

      downloadXML(iosXML, 'iOS');
      setTimeout(() => {
        downloadXML(androidXML, 'Android');
      }, 500);

      setStage("complete");
      toast({
        title: "¡Éxito!",
        description: "Sus archivos XML han sido generados y descargados para iOS y Android.",
      });
    } catch (error) {
      setStage("error");
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to convert file",
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
      </div>

      <div 
        className={`border-2 border-dashed rounded-lg p-8 transition-colors duration-200 ease-in-out ${stage === "converting" ? 'opacity-50' : ''} hover:border-primary hover:bg-primary/5`}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const file = e.dataTransfer.files[0];
          if (file && file.name.endsWith('.docx')) {
            const event = { target: { files: [file] } } as React.ChangeEvent<HTMLInputElement>;
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