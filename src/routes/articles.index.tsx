import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity,
  Apple,
  ArrowRight,
  Baby,
  Bone,
  BookOpen,
  Bookmark,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Dumbbell,
  Ear,
  Eye,
  HeartPulse,
  Mail,
  MessageCircle,
  Search,
  SearchX,
  Share2,
  ShieldCheck,
  Smile,
  Sparkles,
  Stethoscope,
  UserCheck,
  Wind,
  X,
} from "lucide-react";
import { EmptyState, PageHeading, PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ARTICLE_CATEGORIES,
  ARTICLES_DATA,
  ArticleCategory,
  ArticleData,
  HEALTH_TOPICS,
} from "@/lib/data/articles";
import { cn } from "@/lib/utils";

interface ArticlesSearch {
  q?: string | undefined;
  cat?: string | undefined;
}

export const Route = createFileRoute("/articles/")({
  validateSearch: (search: Record<string, unknown>): ArticlesSearch => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
    cat: typeof search["cat"] === "string" ? search["cat"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Health Articles & Education — MediBook" },
      {
        name: "description",
        content: "Doctor-reviewed articles on prevention, nutrition and chronic care.",
      },
      { property: "og:title", content: "Health Articles — MediBook" },
      {
        property: "og:description",
        content: "Doctor-reviewed articles on prevention, nutrition and chronic care.",
      },
    ],
  }),
  component: ArticlesPage,
});

type SortOption = "latest" | "popular" | "views" | "recommended";

/** Topic Icon Resolver */
function TopicIcon({ iconName, className }: { iconName: string; className?: string }) {
  const cnStr = cn("h-5 w-5 shrink-0", className);
  switch (iconName) {
    case "HeartPulse":
      return <HeartPulse className={cnStr} />;
    case "Activity":
      return <Activity className={cnStr} />;
    case "Apple":
      return <Apple className={cnStr} />;
    case "Smile":
      return <Smile className={cnStr} />;
    case "UserCheck":
      return <UserCheck className={cnStr} />;
    case "Baby":
      return <Baby className={cnStr} />;
    case "Sparkles":
      return <Sparkles className={cnStr} />;
    case "Wind":
      return <Wind className={cnStr} />;
    case "Dumbbell":
      return <Dumbbell className={cnStr} />;
    case "Bone":
      return <Bone className={cnStr} />;
    default:
      return <BookOpen className={cnStr} />;
  }
}

function ArticlesPage() {
  const searchParams = Route.useSearch();
  const [q, setQ] = useState<string>(searchParams.q ?? "");
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory>(
    (searchParams.cat as ArticleCategory) &&
      ARTICLE_CATEGORIES.includes(searchParams.cat as ArticleCategory)
      ? (searchParams.cat as ArticleCategory)
      : "All",
  );
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [visibleCount, setVisibleCount] = useState<number>(9);
  const [savedArticles, setSavedArticles] = useState<string[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState<string>("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [activeShareId, setActiveShareId] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Filtered & Sorted Articles logic
  const filteredArticles = useMemo(() => {
    const query = q.trim().toLowerCase();
    return ARTICLES_DATA.filter((art) => {
      // Category filter
      if (selectedCategory !== "All" && art.category !== selectedCategory) return false;
      // Search query filter
      if (query) {
        const haystack = [art.title, art.excerpt, art.category, ...art.tags, art.reviewer]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "popular") return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
      if (sortBy === "views") return b.viewsCount - a.viewsCount;
      if (sortBy === "recommended") return b.doctorReviewed ? 1 : -1;
      // Default latest
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  }, [q, selectedCategory, sortBy]);

  // Featured Article
  const featuredArticle = useMemo(() => {
    return ARTICLES_DATA.find((art) => art.featured) ?? ARTICLES_DATA[0]!;
  }, []);

  // Popular Articles list (top 4-6)
  const popularArticles = useMemo(() => {
    return ARTICLES_DATA.filter((art) => art.popular && !art.featured).slice(0, 6);
  }, []);

  // Search suggestions
  const searchSuggestions = useMemo(() => {
    if (!q.trim()) return [];
    const term = q.trim().toLowerCase();
    return ARTICLES_DATA.filter(
      (a) =>
        a.title.toLowerCase().includes(term) ||
        a.category.toLowerCase().includes(term) ||
        a.tags.some((t) => t.toLowerCase().includes(term)),
    ).slice(0, 5);
  }, [q]);

  const hasActiveFilters = Boolean(q || selectedCategory !== "All");

  const clearFilters = () => {
    setQ("");
    setSelectedCategory("All");
  };

  const toggleSaveArticle = (id: string) => {
    setSavedArticles((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleCopyShareLink = (slug: string) => {
    const url = `${window.location.origin}/articles/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
    setActiveShareId(null);
  };

  const handleSubscribeNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
    }
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 space-y-10">
        {/* Introduction */}
        <PageHeading
          eyebrow="MEDIBOOK"
          title="Health articles"
          subtitle="Doctor-reviewed articles on prevention, nutrition and chronic care."
        />

        {/* Search Bar */}
        <div className="relative max-w-3xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search health articles..."
            className="h-12 sm:h-14 pl-12 pr-10 text-base rounded-2xl border-border bg-card shadow-xs focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Search health articles"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Instant Search Suggestions Dropdown */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-2xl border border-border bg-card p-2 shadow-lift">
              <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Suggested Health Guides
              </div>
              {searchSuggestions.map((item) => (
                <Link
                  key={item.id}
                  to="/articles/$articleId"
                  params={{ articleId: item.slug }}
                  onClick={() => setShowSuggestions(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-secondary/70 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-medium text-foreground truncate max-w-xs sm:max-w-md">
                      {item.title}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-semibold">
                    {item.category}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Category Pills Navigation */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Filter by Category
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>

          <div className="no-scrollbar flex flex-nowrap items-center gap-2 overflow-x-auto pb-2">
            {ARTICLE_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "bg-secondary/80 text-secondary-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Health Guide Section (Shown when no search query active) */}
        {!hasActiveFilters && featuredArticle && (
          <section className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none font-semibold">
                Featured Guide
              </Badge>
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Featured health guide
              </h2>
            </div>

            <div className="group relative rounded-3xl border border-border/80 bg-card overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lift">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                <div className="lg:col-span-6 relative h-64 sm:h-80 lg:h-full bg-muted overflow-hidden">
                  <img
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-black/60 text-white backdrop-blur-md border-none px-3 py-1 font-semibold">
                      {featuredArticle.category}
                    </Badge>
                  </div>
                </div>

                <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    {/* Doctor Reviewed Badge */}
                    {featuredArticle.doctorReviewed && (
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Doctor reviewed · {featuredArticle.reviewerSpecialty}</span>
                      </div>
                    )}

                    <h3 className="text-xl font-bold text-foreground sm:text-2xl group-hover:text-primary transition-colors leading-tight">
                      {featuredArticle.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {featuredArticle.excerpt}
                    </p>
                  </div>

                  <div className="space-y-4 border-t border-border pt-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                      <span>Reviewed by {featuredArticle.reviewer}</span>
                      <span>
                        {featuredArticle.readingTime} min read · {featuredArticle.publishedAt}
                      </span>
                    </div>

                    <Link
                      to="/articles/$articleId"
                      params={{ articleId: featuredArticle.slug }}
                      className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
                    >
                      <span>Read article</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Popular Health Articles Section */}
        {!hasActiveFilters && popularArticles.length > 0 && (
          <section className="space-y-5 pt-2">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Popular health articles
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Trusted information to help you make informed healthcare decisions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {popularArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  isSaved={savedArticles.includes(article.id)}
                  onToggleSave={toggleSaveArticle}
                  activeShareId={activeShareId}
                  setActiveShareId={setActiveShareId}
                  onCopyShare={handleCopyShareLink}
                />
              ))}
            </div>
          </section>
        )}

        {/* Topic Discovery Section */}
        {!hasActiveFilters && (
          <section className="space-y-4 pt-2">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Explore health topics
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Select a health category to filter expert-reviewed guides.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {HEALTH_TOPICS.map((topic) => (
                <button
                  key={topic.name}
                  type="button"
                  onClick={() => setSelectedCategory(topic.name as ArticleCategory)}
                  className="group flex flex-col items-center text-center p-4 rounded-2xl border border-border/80 bg-card hover:border-primary/40 hover:bg-primary-soft/20 transition-all duration-200 shadow-xs"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary-soft-foreground group-hover:scale-105 transition-transform mb-2">
                    <TopicIcon iconName={topic.iconName} />
                  </span>
                  <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                    {topic.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                    {topic.count} articles
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Latest Articles Section & Results Grid */}
        <section className="space-y-6 pt-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {hasActiveFilters
                  ? `Search results for: "${q || selectedCategory}"`
                  : "Latest articles"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {filteredArticles.length} {filteredArticles.length === 1 ? "article" : "articles"}{" "}
                found
              </p>
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase hidden sm:inline">
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-9 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Sort articles"
              >
                <option value="latest">Latest</option>
                <option value="popular">Most Popular</option>
                <option value="views">Most Read</option>
                <option value="recommended">Doctor Reviewed</option>
              </select>
            </div>
          </div>

          {filteredArticles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredArticles.slice(0, visibleCount).map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    isSaved={savedArticles.includes(article.id)}
                    onToggleSave={toggleSaveArticle}
                    activeShareId={activeShareId}
                    setActiveShareId={setActiveShareId}
                    onCopyShare={handleCopyShareLink}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {visibleCount < filteredArticles.length && (
                <div className="pt-6 text-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setVisibleCount((prev) => prev + 6)}
                    className="rounded-2xl px-8 py-3 text-sm font-semibold border-border hover:border-primary hover:bg-primary-soft/20"
                  >
                    Load more articles ({filteredArticles.length - visibleCount} remaining)
                  </Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={<SearchX className="h-8 w-8 text-muted-foreground" />}
              title="No articles found"
              description="Try searching for another health topic or select a different category."
              actionLabel="Clear search"
              onAction={clearFilters}
            />
          )}
        </section>

        {/* Newsletter Subscription Section */}
        <section className="surface-panel p-8 rounded-3xl text-center max-w-3xl mx-auto space-y-4 border border-border">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-soft-foreground mb-1">
            <Mail className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Get useful health information
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Receive new health guides and doctor-reviewed information from MediBook.
            </p>
          </div>

          {newsletterSubscribed ? (
            <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/10 text-emerald-600 px-4 py-2 text-xs font-bold">
              <CheckCircle2 className="h-4 w-4" />
              <span>Thank you! You are subscribed to MediBook Health Updates.</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubscribeNewsletter}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <Input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                className="h-11 rounded-2xl border-border bg-card text-xs"
              />
              <Button type="submit" className="h-11 rounded-2xl px-6 text-xs font-bold shrink-0">
                Subscribe
              </Button>
            </form>
          )}
        </section>

        {/* Medical Disclaimer */}
        <div className="text-center text-xs text-muted-foreground max-w-2xl mx-auto border-t border-border/60 pt-6">
          <p>
            Health information on MediBook is for educational purposes and is not a substitute for
            professional medical advice, diagnosis or treatment.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}

/** Individual Article Card Component */
function ArticleCard({
  article,
  isSaved,
  onToggleSave,
  activeShareId,
  setActiveShareId,
  onCopyShare,
}: {
  article: ArticleData;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  activeShareId: string | null;
  setActiveShareId: (id: string | null) => void;
  onCopyShare: (slug: string) => void;
}) {
  const isSharing = activeShareId === article.id;

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lift">
      <div>
        {/* Cover Image & Badges */}
        <div className="relative h-44 w-full overflow-hidden bg-muted">
          <img
            src={article.image}
            alt={article.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <Badge className="bg-black/60 text-white backdrop-blur-md border-none px-3 py-1 font-semibold text-[11px]">
              {article.category}
            </Badge>
          </div>

          {/* Action Buttons: Bookmark & Share */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onToggleSave(article.id)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors"
              aria-label="Save article"
            >
              <Bookmark
                className={cn(
                  "h-3.5 w-3.5 transition-colors",
                  isSaved && "fill-primary text-primary",
                )}
              />
            </button>
            <button
              type="button"
              onClick={() => setActiveShareId(isSharing ? null : article.id)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors"
              aria-label="Share article"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Share Popover Menu */}
          {isSharing && (
            <div className="absolute right-3 top-12 z-20 w-44 rounded-2xl border border-border bg-card p-2 shadow-lift text-xs space-y-1">
              <button
                type="button"
                onClick={() => onCopyShare(article.slug)}
                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left font-medium text-foreground hover:bg-secondary transition-colors"
              >
                <Copy className="h-3.5 w-3.5 text-primary" />
                <span>Copy Link</span>
              </button>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left font-medium text-foreground hover:bg-secondary transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
                <span>WhatsApp</span>
              </a>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3">
          {/* Doctor Reviewed Tag */}
          {article.doctorReviewed && (
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>Doctor reviewed</span>
            </div>
          )}

          <h3 className="font-bold text-foreground text-base group-hover:text-primary transition-colors leading-tight line-clamp-2">
            {article.title}
          </h3>

          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {article.excerpt}
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-5 pt-0 space-y-3">
        <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground border-t border-border/70 pt-3">
          <span className="truncate max-w-[130px]">By {article.reviewer}</span>
          <span>
            {article.readingTime} min read · {article.publishedAt}
          </span>
        </div>

        <Link
          to="/articles/$articleId"
          params={{ articleId: article.slug }}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-secondary/80 px-4 py-2.5 text-xs font-bold text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <span>Read article</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
