import { Upload, FileCheck2 } from "lucide-react";
import { useRef, useState } from "react";

interface Props {
  onFile: (text: string, name: string) => void;
  loaded?: { name: string; count: number } | null;
}

export const DatasetUpload = ({ onFile, loaded }: Props) => {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handle = async (file: File) => {
    const text = await file.text();
    onFile(text, file.name);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault(); setDrag(false);
        const f = e.dataTransfer.files[0];
        if (f) handle(f);
      }}
      onClick={() => ref.current?.click()}
      className={`cursor-pointer rounded-2xl border-2 border-dashed transition-all p-10 text-center bg-card-gradient ${
        drag ? "border-primary shadow-glow scale-[1.01]" : "border-border hover:border-primary/50"
      }`}
    >
      <input
        ref={ref} type="file" accept=".csv,text/csv" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); }}
      />
      {loaded ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <FileCheck2 className="w-8 h-8 text-primary" />
          </div>
          <p className="font-display text-2xl">{loaded.name}</p>
          <p className="text-muted-foreground text-sm">
            <span className="text-gradient-gold font-semibold">{loaded.count.toLocaleString()}</span> movies loaded · click to replace
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <p className="font-display text-2xl">Upload your movie dataset</p>
          <p className="text-muted-foreground text-sm max-w-md">
            Drop a CSV with columns like <code className="text-primary">title, genres, overview, rating</code>. Everything runs locally in your browser.
          </p>
        </div>
      )}
    </div>
  );
};
