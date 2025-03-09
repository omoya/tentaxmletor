import type { Express, Request } from "express";
import { createServer } from "http";
import multer from "multer";
import mammoth from "mammoth";
import { storage } from "./storage";
import { JSDOM } from "jsdom";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('Incoming file:', file.originalname, 'Mimetype:', file.mimetype);
    if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      cb(null, true);
    } else {
      cb(null, false);
      const error = new Error("Only .docx files are allowed");
      console.error('File rejected:', error.message);
      cb(error);
    }
  }
});

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

function generateXMLForIOS(paragraphs: NodeListOf<Element>, title: string, author: string): string {
  let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xmlContent += `<relato titulo="${title}" autor="${author}">\n`;

  paragraphs.forEach((p, index) => {
    // Split paragraph by line breaks
    let text = p.innerHTML;
    // Remove strong tags
    text = text.replace(/<\/?strong>/g, '');
    // Replace <i> and <em> tags with iOS format
    text = text.replace(/<(i|em)>(.*?)<\/(i|em)>/g, ' *SL* $2 *SL* ');

    // Count consecutive <br> tags
    const brMatches = text.match(/(?:<br\s*\/?>)+/g) || [];
    const segments = text.split(/(?:<br\s*\/?>)+/);

    segments.forEach((segment, index) => {
      const trimmedSegment = segment.trim();

      // Handle the content
      if (trimmedSegment !== '') {
        xmlContent += '  <parrafo>\n';
        xmlContent += '    <just>i</just>\n';
        xmlContent += '    <cap>0</cap>\n';
        xmlContent += '    <saltolinea>0</saltolinea>\n';
        xmlContent += '    <sangria>0</sangria>\n';
        xmlContent += '    <font>basica</font>\n';
        xmlContent += '    <size>0</size>\n';
        xmlContent += `    <gratis>${index < 2 ? '1' : '0'}</gratis>\n`;
        xmlContent += '    <img>0</img>\n';
        xmlContent += '    <bloque>' + trimmedSegment + '</bloque>\n';
        xmlContent += '  </parrafo>\n';
      }

      // Add empty line paragraphs based on number of <br> tags
      if (index < brMatches.length) {
        const brCount = (brMatches[index].match(/<br\s*\/?>/g) || []).length;
        const emptyLines = Math.max(0, Math.floor((brCount - 1) / 2));

        for (let i = 0; i < emptyLines; i++) {
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
        }
      }
    });
  });

  xmlContent += '</relato>';
  return xmlContent;
}

function generateXMLForAndroid(paragraphs: NodeListOf<Element>, title: string, author: string): string {
  let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xmlContent += `<relato titulo="${title}" autor="${author}">\n`;

  paragraphs.forEach((p, index) => {
    // Split paragraph by line breaks
    let text = p.innerHTML;
    // Remove strong tags
    text = text.replace(/<\/?strong>/g, '');
    // Replace <i> and <em> tags with Android format
    text = text.replace(/<(i|em)>(.*?)<\/(i|em)>/g, '*C*$2*C*');

    // Count consecutive <br> tags
    const brMatches = text.match(/(?:<br\s*\/?>)+/g) || [];
    const segments = text.split(/(?:<br\s*\/?>)+/);

    segments.forEach((segment, index) => {
      const trimmedSegment = segment.trim();

      // Handle the content
      if (trimmedSegment !== '') {
        xmlContent += '  <parrafo>\n';
        xmlContent += '    <just>i</just>\n';
        xmlContent += '    <cap>0</cap>\n';
        xmlContent += '    <saltolinea>0</saltolinea>\n';
        xmlContent += '    <sangria>0</sangria>\n';
        xmlContent += '    <font>basica</font>\n';
        xmlContent += '    <size>0</size>\n';
        xmlContent += `    <gratis>${index < 2 ? '1' : '0'}</gratis>\n`;
        xmlContent += '    <img>0</img>\n';
        xmlContent += '    <bloque>' + trimmedSegment + '</bloque>\n';
        xmlContent += '  </parrafo>\n';
      }

      // Add empty line paragraphs based on number of <br> tags
      if (index < brMatches.length) {
        const brCount = (brMatches[index].match(/<br\s*\/?>/g) || []).length;
        const emptyLines = Math.max(0, Math.floor((brCount - 1) / 2));

        for (let i = 0; i < emptyLines; i++) {
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
        }
      }
    });
  });

  xmlContent += '</relato>';
  return xmlContent;
}

export function registerRoutes(app: Express) {
  app.post('/api/convert', upload.single('file'), async (req: MulterRequest, res) => {
    try {
      console.log('Request received:', {
        hasFile: !!req.file,
        contentType: req.get('Content-Type'),
        fileDetails: req.file ? {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        } : 'No file'
      });

      if (!req.file) {
        console.error('No file in request');
        return res.status(400).json({ 
          success: false,
          error: "No file uploaded or invalid file type. Please upload a .docx file." 
        });
      }

      const title = req.body.title || "Untitled";
      const author = req.body.author || "Unknown";

      // Convert .docx to HTML using mammoth
      const result = await mammoth.convertToHtml({buffer: req.file.buffer});

      // Parse HTML and convert to XML
      const dom = new JSDOM(result.value);
      const paragraphs = dom.window.document.querySelectorAll('p');

      const iosXML = generateXMLForIOS(paragraphs, title, author);
      const androidXML = generateXMLForAndroid(paragraphs, title, author);

      const conversionResult = {
        success: true,
        iosXML,
        androidXML
      };

      const id = await storage.storeConversionResult(conversionResult);
      console.log('Conversion successful, stored with ID:', id);
      res.json({ id });

    } catch (error) {
      console.error('Conversion error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  });

  app.get('/api/convert/:id', async (req, res) => {
    const result = await storage.getConversionResult(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "Conversion not found" });
    }
    res.json(result);
  });

  return createServer(app);
}