import { Star, Film } from "lucide-react";
import type { Movie } from "@/lib/recommender";

interface Props {
  movie: Movie;
  rank?: number;
  score?: number;
}

export const MovieCard = ({ movie, rank, score }: Props) => {
  return (
    <article className="group relative overflow-hidden rounded-xl bg-card-gradient border border-border p-5 shadow-elegant transition-all duration-500 hover:border-primary/40 hover:-translate-y-1 hover:shadow-glow">
      {rank !== undefined && (
        <div className="absolute -top-3 -left-3 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-display text-2xl font-black text-primary-foreground shadow-glow">
          {rank}
        </div>
      )}
      <div className="flex items-start gap-3 mb-3 mt-2">
        <Film className="w-5 h-5 text-primary mt-1 shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-xl font-bold leading-tight text-foreground group-hover:text-gradient-gold transition-colors">
            {movie.title}
          </h3>
          {movie.year && <p className="text-xs text-muted-foreground mt-1">{movie.year}</p>}
        </div>
      </div>

      {movie.genres && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {movie.genres.split(/[,|]/).slice(0, 3).map((g, i) => (
            <span key={i} className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
              {g.trim()}
            </span>
          ))}
        </div>
      )}

      {movie.overview && (
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {movie.overview}
        </p>
      )}

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        {typeof movie.rating === "number" && !isNaN(movie.rating) ? (
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-primary text-primary" />
            <span className="font-semibold text-sm">{movie.rating.toFixed(1)}</span>
          </div>
        ) : <span />}
        {score !== undefined && (
          <span className="text-xs font-mono text-accent">
            {(score * 100).toFixed(1)}% match
          </span>
        )}
      </div>
    </article>
  );
};
