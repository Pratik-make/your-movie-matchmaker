import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Movie } from "@/lib/recommender";

interface Props {
  movies: Movie[];
  onSelect: (idx: number) => void;
}

export const MovieSearch = ({ movies, onSelect }: Props) => {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const needle = q.toLowerCase();
    return movies
      .map((m, i) => ({ m, i }))
      .filter(({ m }) => m.title.toLowerCase().includes(needle))
      .slice(0, 8);
  }, [q, movies]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search a movie you love…"
          className="w-full bg-card-gradient border border-border rounded-full pl-14 pr-6 py-5 text-lg outline-none transition-all focus:border-primary focus:shadow-glow placeholder:text-muted-foreground"
        />
      </div>
      {open && results.length > 0 && (
        <ul className="absolute z-20 w-full mt-2 bg-card border border-border rounded-2xl overflow-hidden shadow-elegant max-h-80 overflow-y-auto">
          {results.map(({ m, i }) => (
            <li key={i}>
              <button
                onMouseDown={(e) => { e.preventDefault(); onSelect(i); setQ(m.title); setOpen(false); }}
                className="w-full text-left px-5 py-3 hover:bg-secondary transition-colors flex items-center justify-between gap-4"
              >
                <span className="font-medium truncate">{m.title}</span>
                {m.year && <span className="text-xs text-muted-foreground shrink-0">{m.year}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
