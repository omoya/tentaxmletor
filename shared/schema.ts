import { z } from "zod";

// Document conversion schema
export const convertDocumentSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "Only .docx files are allowed"
  ),
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required")
});

export type ConvertDocument = z.infer<typeof convertDocumentSchema>;

// XML Paragraph type
export interface XMLParagraph {
  text: string;
  bold?: boolean;
}

// Conversion response
export interface ConversionResult {
  success: boolean;
  iosXML?: string;
  androidXML?: string;
  error?: string;
}