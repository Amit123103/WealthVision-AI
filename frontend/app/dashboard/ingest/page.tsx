import Dropzone from '@/components/Dropzone';

export default function DashboardIngestPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-73px)] relative overflow-y-auto custom-scrollbar bg-background">
      <div className="w-full max-w-3xl mx-auto mt-12 p-6 z-10 relative mb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Data Ingestion Engine</h1>
          <p className="text-muted-foreground">Securely upload and queue street-level imagery payloads for AI-driven wealth estimation analysis.</p>
        </div>
        <Dropzone />
      </div>
    </div>
  );
}
