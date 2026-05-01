import { useMemo, useState } from "react";
import { Sparkles, TrendingUp, Wand2, Download } from "lucide-react";
import { toast } from "sonner";
import { DatasetUpload } from "@/components/DatasetUpload";
import { MovieSearch } from "@/components/MovieSearch";
import { MovieCard } from "@/components/MovieCard";
import {
  parseCSV, buildMovies, vectorize, recommendByMovie, topRated,
  type Movie, type Vectorized,
} from "@/lib/recommender";

const SAMPLE_CSV = `title,genres,overview,rating,year
The Dark Knight,Action|Crime|Drama,Batman faces the Joker a chaotic criminal mastermind in Gotham,9.0,2008
Inception,Sci-Fi|Action|Thriller,A thief enters dreams to plant ideas in the mind of a CEO,8.8,2010
Interstellar,Sci-Fi|Drama|Adventure,Astronauts travel through a wormhole to save humanity from extinction,8.6,2014
The Godfather,Crime|Drama,The aging patriarch of an organized crime dynasty transfers control,9.2,1972
Pulp Fiction,Crime|Drama,Lives of two mob hitmen a boxer and gangsters intertwine in violence,8.9,1994
The Matrix,Sci-Fi|Action,A hacker discovers reality is a simulation and joins a rebellion,8.7,1999
Forrest Gump,Drama|Romance,A slow-witted man witnesses key historical events with love and luck,8.8,1994
Fight Club,Drama|Thriller,An insomniac forms an underground fight club with a soap salesman,8.8,1999
Goodfellas,Crime|Drama,The story of Henry Hill rising through the ranks of the mafia,8.7,1990
The Shawshank Redemption,Drama,Two imprisoned men bond over years finding solace and redemption,9.3,1994
Parasite,Thriller|Drama,A poor family schemes to become employed by a wealthy household,8.6,2019
Whiplash,Drama|Music,A young drummer is pushed to the brink by a ruthless jazz instructor,8.5,2014
La La Land,Romance|Musical|Drama,A jazz pianist and aspiring actress fall in love in Los Angeles,8.0,2016
Mad Max Fury Road,Action|Adventure|Sci-Fi,In a post-apocalyptic wasteland a woman rebels against a tyrant,8.1,2015
The Prestige,Drama|Mystery|Thriller,Two rival magicians engage in a deadly competition of illusion,8.5,2006
Memento,Mystery|Thriller,A man with short-term memory loss hunts his wife's killer,8.4,2000
Gladiator,Action|Drama|Adventure,A betrayed Roman general seeks revenge as a gladiator in the arena,8.5,2000
Joker,Crime|Drama|Thriller,A failed comedian descends into madness and becomes a criminal icon,8.4,2019
Avengers Endgame,Action|Adventure|Sci-Fi,The Avengers assemble once more to reverse Thanos catastrophic actions,8.4,2019
Spirited Away,Animation|Adventure|Family,A young girl enters a magical world of spirits to save her parents,8.6,2001`;

const Index = () => {
  const [vec, setVec] = useState<Vectorized | null>(null);
  const [fileMeta, setFileMeta] = useState<{ name: string; count: number } | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const loadCSV = (text: string, name: string) => {
    try {
      const rows = parseCSV(text);
      const movies = buildMovies(rows);
      if (!movies.length) {
        toast.error("No valid movies found. Make sure your CSV has a 'title' column.");
        return;
      }
      const v = vectorize(movies);
      setVec(v);
      setFileMeta({ name, count: movies.length });
      setSelected(null);
      toast.success(`Loaded ${movies.length} movies from ${name}`);
    } catch (e) {
      toast.error("Failed to parse CSV");
    }
  };

  const top10 = useMemo<Movie[]>(() => (vec ? topRated(vec.movies, 10) : []), [vec]);
  const similar = useMemo(
    () => (vec && selected !== null ? recommendByMovie(vec, selected, 10) : []),
    [vec, selected]
  );

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative px-6 pt-20 pb-16 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/50 backdrop-blur text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Content-based ML · runs in your browser
        </div>
        <h1 className="font-display text-6xl md:text-8xl font-black leading-[0.95] mb-6">
          Find your <span className="text-gradient-gold italic">next</span><br />
          favorite film.
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Upload a movie dataset, pick a film you love, and our TF-IDF recommender surfaces ten cinematic kindred spirits — instantly, privately.
        </p>
      </section>

      {/* Upload */}
      <section className="px-6 max-w-4xl mx-auto mb-12">
        <DatasetUpload onFile={loadCSV} loaded={fileMeta} />
        {!fileMeta && (
          <button
            onClick={() => loadCSV(SAMPLE_CSV, "sample-movies.csv")}
            className="mt-4 mx-auto flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Download className="w-4 h-4" />
            Or try with a sample dataset
          </button>
        )}
      </section>

      {vec && fileMeta && (
        <>
          {/* Search */}
          <section className="px-6 max-w-7xl mx-auto mb-16">
            <div className="flex items-center gap-3 mb-6 justify-center">
              <Wand2 className="w-5 h-5 text-primary" />
              <h2 className="font-display text-3xl">Get personalized picks</h2>
            </div>
            <MovieSearch movies={vec.movies} onSelect={setSelected} />
          </section>

          {/* Similar */}
          {selected !== null && (
            <section className="px-6 max-w-7xl mx-auto mb-20">
              <div className="mb-8 text-center">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
                  Because you picked
                </p>
                <h2 className="font-display text-4xl md:text-5xl text-gradient-gold">
                  {vec.movies[selected].title}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {similar.map(({ movie, score }, i) => (
                  <MovieCard key={movie.id} movie={movie} rank={i + 1} score={score} />
                ))}
              </div>
            </section>
          )}

          {/* Top 10 */}
          <section className="px-6 max-w-7xl mx-auto pb-24">
            <div className="flex items-center gap-3 mb-8 justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="font-display text-4xl">Top 10 from your dataset</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {top10.map((m, i) => (
                <MovieCard key={m.id} movie={m} rank={i + 1} />
              ))}
            </div>
          </section>
        </>
      )}

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Built with TF-IDF + cosine similarity · 100% client-side
      </footer>
    </main>
  );
};

export default Index;
