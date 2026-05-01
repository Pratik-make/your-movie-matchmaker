export interface Movie {
  id: number;
  title: string;
  genres?: string;
  overview?: string;
  keywords?: string;
  rating?: number;
  year?: string;
  director?: string;
  cast?: string;
  tags: string;
}

export function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let val = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { val += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else val += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { cur.push(val); val = ""; }
      else if (c === "\n" || c === "\r") {
        if (val.length || cur.length) { cur.push(val); rows.push(cur); cur = []; val = ""; }
        if (c === "\r" && text[i + 1] === "\n") i++;
      } else val += c;
    }
  }
  if (val.length || cur.length) { cur.push(val); rows.push(cur); }
  if (!rows.length) return [];
  const headers = rows[0].map(h => h.trim().toLowerCase());
  return rows.slice(1).filter(r => r.length === headers.length).map(r => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h] = r[i] ?? ""));
    return obj;
  });
}

const pick = (row: Record<string, string>, keys: string[]) => {
  for (const k of keys) if (row[k]) return row[k];
  return "";
};

export function buildMovies(rows: Record<string, string>[]): Movie[] {
  return rows.map((r, idx) => {
    const title = pick(r, ["title", "name", "movie", "movie_title", "original_title"]);
    const genres = pick(r, ["genres", "genre", "category"]);
    const overview = pick(r, ["overview", "description", "plot", "summary"]);
    const keywords = pick(r, ["keywords", "tags", "tag"]);
    const director = pick(r, ["director", "directors"]);
    const cast = pick(r, ["cast", "actors", "stars"]);
    const ratingStr = pick(r, ["rating", "vote_average", "imdb_rating", "score"]);
    const year = pick(r, ["year", "release_year", "release_date"]).slice(0, 4);
    const tags = [genres, keywords, overview, director, cast]
      .join(" ")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return {
      id: idx,
      title: title || `Movie ${idx + 1}`,
      genres, overview, keywords, director, cast,
      year, rating: ratingStr ? parseFloat(ratingStr) : undefined,
      tags,
    };
  }).filter(m => m.title && m.tags.length > 3);
}

const STOP = new Set(["the","a","an","and","or","of","to","in","on","at","with","for","is","it","by","this","that","from","as","be","are","was","were","but","not","he","she","his","her","they","their","its","i","you","we","us","our","my","me"]);

function tokenize(s: string): string[] {
  return s.split(" ").filter(t => t.length > 2 && !STOP.has(t));
}

export interface Vectorized {
  movies: Movie[];
  vectors: Map<string, number>[];
  norms: number[];
  idf: Map<string, number>;
}

export function vectorize(movies: Movie[]): Vectorized {
  const docs = movies.map(m => tokenize(m.tags));
  const df = new Map<string, number>();
  docs.forEach(doc => {
    new Set(doc).forEach(t => df.set(t, (df.get(t) || 0) + 1));
  });
  const N = movies.length;
  const idf = new Map<string, number>();
  df.forEach((v, k) => idf.set(k, Math.log((N + 1) / (v + 1)) + 1));

  const vectors = docs.map(doc => {
    const tf = new Map<string, number>();
    doc.forEach(t => tf.set(t, (tf.get(t) || 0) + 1));
    const v = new Map<string, number>();
    tf.forEach((f, t) => v.set(t, (f / doc.length) * (idf.get(t) || 0)));
    return v;
  });
  const norms = vectors.map(v => {
    let s = 0; v.forEach(x => (s += x * x)); return Math.sqrt(s) || 1;
  });
  return { movies, vectors, norms, idf };
}

function cosine(a: Map<string, number>, b: Map<string, number>, na: number, nb: number) {
  let dot = 0;
  const [small, big] = a.size < b.size ? [a, b] : [b, a];
  small.forEach((v, k) => { const o = big.get(k); if (o) dot += v * o; });
  return dot / (na * nb);
}

export function recommendByMovie(v: Vectorized, idx: number, k = 10): { movie: Movie; score: number }[] {
  const base = v.vectors[idx];
  const bn = v.norms[idx];
  const scores: { movie: Movie; score: number }[] = [];
  for (let i = 0; i < v.movies.length; i++) {
    if (i === idx) continue;
    scores.push({ movie: v.movies[i], score: cosine(base, v.vectors[i], bn, v.norms[i]) });
  }
  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, k);
}

export function topRated(movies: Movie[], k = 10): Movie[] {
  const withRating = movies.filter(m => typeof m.rating === "number" && !isNaN(m.rating!));
  const pool = withRating.length >= k ? withRating : movies;
  return [...pool]
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, k);
}
