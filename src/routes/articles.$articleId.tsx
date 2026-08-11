import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  HeartPulse,
  MessageCircle,
  Share2,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ARTICLES_DATA, ArticleData } from "@/lib/data/articles";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/articles/$articleId")({
  head: ({ params }) => {
    const article = ARTICLES_DATA.find(
      (a) => a.id === params.articleId || a.slug === params.articleId,
    );
    const title = article?.title ?? "Health article";
    return {
      meta: [
        { title: `${title} — MediBook` },
        { name: "description", content: article?.excerpt ?? "Doctor-reviewed health guide." },
        { property: "og:title", content: `${title} — MediBook` },
        {
          property: "og:description",
          content: article?.excerpt ?? "Doctor-reviewed health guide.",
        },
      ],
    };
  },
  component: ArticleReaderPage,
});

function ArticleReaderPage() {
  const { articleId } = Route.useParams();
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const article: ArticleData = useMemo(() => {
    const found = ARTICLES_DATA.find((a) => a.id === articleId || a.slug === articleId);
    if (found) return found;
    return ARTICLES_DATA[0]!;
  }, [articleId]);

  const relatedArticles = useMemo(() => {
    return ARTICLES_DATA.filter(
      (a) => a.id !== article.id && a.category === article.category,
    ).slice(0, 3);
  }, [article]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:py-12 space-y-8">
        {/* Back Button */}
        <Link
          to="/articles"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Health Articles</span>
        </Link>

        {/* Article Reader Container */}
        <article className="surface-panel p-6 sm:p-10 rounded-3xl space-y-8 border border-border">
          {/* Header Metadata */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-primary-soft text-primary-soft-foreground border-none px-3 py-1 font-semibold">
                {article.category}
              </Badge>
              {article.doctorReviewed && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Doctor reviewed · {article.reviewerSpecialty}</span>
                </div>
              )}
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl leading-tight">
              {article.title}
            </h1>

            <p className="text-base text-muted-foreground leading-relaxed">{article.excerpt}</p>

            {/* Author / Reviewer & Actions Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-y border-border py-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary-soft-foreground font-bold">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-bold text-foreground block">
                    Reviewed by {article.reviewer}
                  </span>
                  <span className="text-muted-foreground">
                    {article.reviewerSpecialty} · {article.publishedAt}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSaved(!isSaved)}
                  className="rounded-xl text-xs font-semibold gap-1.5"
                >
                  <Bookmark className={cn("h-3.5 w-3.5", isSaved && "fill-primary text-primary")} />
                  <span>{isSaved ? "Saved" : "Save Guide"}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="rounded-xl text-xs font-semibold gap-1.5"
                >
                  <Copy className="h-3.5 w-3.5 text-primary" />
                  <span>{copiedLink ? "Link Copied!" : "Share"}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Hero Banner Image */}
          <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden bg-muted">
            <img src={article.image} alt={article.title} className="h-full w-full object-cover" />
          </div>

          {/* Article Body Content */}
          <div className="space-y-6 text-foreground text-sm sm:text-base leading-relaxed">
            {article.content.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}

            <div className="rounded-2xl bg-secondary/50 p-6 border border-border space-y-2">
              <h3 className="font-bold text-base text-foreground">Key Medical Takeaways</h3>
              <ul className="list-disc list-inside text-xs sm:text-sm text-muted-foreground space-y-1.5">
                <li>Always consult your primary care doctor for persistent symptoms.</li>
                <li>Routine diagnostic screenings help prevent chronic conditions early.</li>
                <li>
                  Lifestyle modifications play a crucial role alongside medical treatment plans.
                </li>
              </ul>
            </div>
          </div>

          {/* Tags */}
          <div className="pt-4 border-t border-border flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Tags:
            </span>
            {article.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs font-normal">
                #{tag}
              </Badge>
            ))}
          </div>
        </article>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <section className="space-y-4 pt-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Related Health Guides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.id}
                  to="/articles/$articleId"
                  params={{ articleId: rel.slug }}
                  className="group rounded-3xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lift"
                >
                  <div className="h-32 w-full rounded-xl overflow-hidden bg-muted mb-3">
                    <img
                      src={rel.image}
                      alt={rel.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-semibold mb-2">
                    {rel.category}
                  </Badge>
                  <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {rel.title}
                  </h3>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{rel.readingTime} min read</span>
                    <ArrowRight className="h-3.5 w-3.5 text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </PublicLayout>
  );
}
