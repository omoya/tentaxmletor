import { Card, CardContent } from "@/components/ui/card";
import { FileUpload } from "@/components/FileUpload";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
            Formatacle
          </h1>
          <p className="text-muted-foreground">
            Sube un archivo .doc para convertirlo a un documento XML con formato específico
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <FileUpload />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
