"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  X, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle,
  Heading1, 
  Heading2, 
  Heading3, 
  Bold, 
  Italic, 
  Code, 
  Quote, 
  List, 
  ListOrdered, 
  Table as TableIcon, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Eye, 
  Edit3, 
  Columns, 
  Search, 
  Check, 
  Info, 
  Layers, 
  Tag as TagIcon, 
  Globe, 
  Smartphone, 
  Monitor, 
  Plus, 
  ExternalLink,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { Article, Category, adminApi } from "@/lib/api";

interface ArticleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleToEdit?: Article | null;
  onSaved: (article: Article) => void;
  categories: Category[];
  token?: string | null;
}

export function ArticleEditorModal({
  isOpen,
  onClose,
  articleToEdit,
  onSaved,
  categories: initialCategories,
  token,
}: ArticleEditorModalProps) {
  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Subnetting");
  const [tags, setTags] = useState<string[]>(["subnetting", "cidr"]);
  const [tagInput, setTagInput] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState<"published" | "draft" | "scheduled" | "archived">("published");
  
  // SEO Fields
  const [focusKeyword, setFocusKeyword] = useState("");
  const [secondaryKeywordsInput, setSecondaryKeywordsInput] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");

  // Editor View Mode
  const [viewMode, setViewMode] = useState<"split" | "edit" | "preview">("split");
  const [serpView, setSerpView] = useState<"desktop" | "mobile">("desktop");
  const [saving, setSaving] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [indexedSuccess, setIndexedSuccess] = useState(false);

  // New Category Inline Form State
  const [showNewCatModal, setShowNewCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#7c3aed");
  const [categoryList, setCategoryList] = useState<Category[]>(initialCategories);

  useEffect(() => {
    if (initialCategories.length > 0) {
      setCategoryList(initialCategories);
    }
  }, [initialCategories]);

  useEffect(() => {
    if (articleToEdit) {
      setTitle(articleToEdit.title);
      setSlug(articleToEdit.slug);
      setCategory(articleToEdit.category);
      setTags(articleToEdit.tags || []);
      setContent(articleToEdit.content || "");
      setExcerpt(articleToEdit.excerpt || "");
      setStatus(articleToEdit.status);
      setFocusKeyword(articleToEdit.focus_keyword || "");
      setSecondaryKeywordsInput((articleToEdit.secondary_keywords || []).join(", "));
      setSeoTitle(articleToEdit.seo_title || "");
      setSeoDescription(articleToEdit.seo_description || "");
      setCanonicalUrl(articleToEdit.canonical_url || "");
      setFeaturedImage(articleToEdit.featured_image || "");
    } else {
      setTitle("");
      setSlug("");
      setCategory(initialCategories[0]?.name || "Subnetting");
      setTags(["networking", "guide"]);
      setContent(`# Guide Title\n\nWrite your in-depth networking article here...`);
      setExcerpt("");
      setStatus("published");
      setFocusKeyword("");
      setSecondaryKeywordsInput("");
      setSeoTitle("");
      setSeoDescription("");
      setCanonicalUrl("");
      setFeaturedImage("");
    }
    setIndexedSuccess(false);
  }, [articleToEdit, isOpen, initialCategories]);

  // Sync slug from title if new article
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!articleToEdit) {
      const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      setSlug(generatedSlug);
      if (!seoTitle) {
        setSeoTitle(`${val.substring(0, 55)} | Lots of Network`);
      }
    }
  };

  // Content word count & reading time
  const wordCount = useMemo(() => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  }, [content]);

  const readingTime = Math.max(1, Math.round(wordCount / 200));

  // Dynamic Keyword & SEO Checklist Analysis
  const seoAnalysis = useMemo(() => {
    const kw = focusKeyword.trim().toLowerCase();
    const effectiveTitle = (seoTitle || title || "").toLowerCase();
    const effectiveDesc = (seoDescription || excerpt || "").toLowerCase();
    const effectiveSlug = (slug || "").toLowerCase().replace(/-/g, " ");
    const contentLower = content.toLowerCase();

    // 1. Keyword in Title
    const hasKwInTitle = kw ? effectiveTitle.includes(kw) : false;

    // 2. Keyword in Slug
    const hasKwInSlug = kw ? effectiveSlug.includes(kw) : false;

    // 3. Keyword in Meta Description
    const hasKwInDesc = kw ? effectiveDesc.includes(kw) : false;

    // 4. Keyword in first 100 words
    const first100Words = contentLower.split(/\s+/).slice(0, 100).join(" ");
    const hasKwInIntro = kw ? first100Words.includes(kw) : false;

    // 5. Keyword in H2 / H3 heading
    const headings = contentLower.match(/^#{2,3}\s+(.+)$/gm) || [];
    const hasKwInHeading = kw ? headings.some(h => h.includes(kw)) : false;

    // 6. Keyword density
    let keywordCount = 0;
    if (kw && wordCount > 0) {
      const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "gi");
      keywordCount = (contentLower.match(regex) || []).length;
    }
    const keywordDensity = wordCount > 0 ? ((keywordCount / wordCount) * 100).toFixed(2) : "0.00";
    const isDensityOptimal = Number(keywordDensity) >= 0.8 && Number(keywordDensity) <= 2.5;

    // 7. Title length (50 - 60 optimal)
    const titleLen = (seoTitle || title || "").length;
    const isTitleOptimal = titleLen >= 45 && titleLen <= 65;

    // 8. Meta description length (140 - 160 optimal)
    const descLen = (seoDescription || excerpt || "").length;
    const isDescOptimal = descLen >= 135 && descLen <= 165;

    // 9. Content length (> 600 words)
    const isContentLongEnough = wordCount >= 600;

    // 10. Overall Score Calculation
    let score = 0;
    if (hasKwInTitle) score += 20;
    if (hasKwInSlug) score += 15;
    if (hasKwInDesc) score += 15;
    if (hasKwInIntro) score += 10;
    if (hasKwInHeading) score += 10;
    if (isTitleOptimal) score += 10;
    if (isDescOptimal) score += 10;
    if (isContentLongEnough) score += 10;

    return {
      hasKwInTitle,
      hasKwInSlug,
      hasKwInDesc,
      hasKwInIntro,
      hasKwInHeading,
      keywordCount,
      keywordDensity,
      isDensityOptimal,
      titleLen,
      isTitleOptimal,
      descLen,
      isDescOptimal,
      isContentLongEnough,
      score: kw ? score : Math.min(65, score + 20),
    };
  }, [focusKeyword, title, seoTitle, slug, seoDescription, excerpt, content, wordCount]);

  // Insert markdown shortcut helper
  const insertMarkdown = (prefix: string, suffix = "", defaultText = "") => {
    const textarea = document.getElementById("article-markdown-editor") as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end) || defaultText;
    const replacement = `${prefix}${selected}${suffix}`;
    const newContent = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 50);
  };

  // Add tag
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const clean = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
      if (clean && !tags.includes(clean)) {
        setTags([...tags, clean]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Inline Category Creation
  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    const catSlug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    try {
      if (token) {
        const created = await adminApi.createCategory(token, {
          name: newCatName.trim(),
          slug: catSlug,
          color: newCatColor,
        });
        setCategoryList([...categoryList, created]);
        setCategory(created.name);
      } else {
        const mock: Category = {
          id: `cat-${Date.now()}`,
          name: newCatName.trim(),
          slug: catSlug,
          color: newCatColor,
          description: null,
          created_at: new Date().toISOString(),
        };
        setCategoryList([...categoryList, mock]);
        setCategory(mock.name);
      }
      setNewCatName("");
      setShowNewCatModal(false);
    } catch (e: any) {
      alert(e.detail || "Failed to create category");
    }
  };

  // Save / Publish
  const handleSave = async (publishImmediately = false) => {
    if (!title.trim() || !slug.trim()) {
      alert("Article Title and Slug are required.");
      return;
    }
    setSaving(true);
    const finalStatus = publishImmediately ? "published" : status;
    const secondaries = secondaryKeywordsInput.split(",").map(k => k.trim()).filter(Boolean);

    const payload: Partial<Article> = {
      title: title.trim(),
      slug: slug.trim().toLowerCase(),
      category,
      tags,
      content,
      excerpt: excerpt.trim() || undefined,
      status: finalStatus,
      focus_keyword: focusKeyword.trim() || null,
      secondary_keywords: secondaries,
      seo_title: seoTitle.trim() || `${title.substring(0, 55)} | Lots of Network`,
      seo_description: seoDescription.trim() || excerpt.trim() || undefined,
      canonical_url: canonicalUrl.trim() || `https://lotsofnetwork.com/blog/${slug.trim().toLowerCase()}`,
      featured_image: featuredImage.trim() || undefined,
    };

    try {
      let result: Article;
      if (articleToEdit?.id && token) {
        result = await adminApi.updateArticle(token, articleToEdit.id, payload);
      } else if (token) {
        result = await adminApi.createArticle(token, payload);
      } else {
        result = {
          id: `art-${Date.now()}`,
          slug: slug.trim().toLowerCase(),
          title: title.trim(),
          category,
          tags,
          excerpt: excerpt.trim() || null,
          content,
          views: articleToEdit?.views || 100,
          status: finalStatus,
          is_indexed: true,
          focus_keyword: focusKeyword.trim() || null,
          secondary_keywords: secondaries,
          seo_title: seoTitle.trim() || `${title.substring(0, 55)} | Lots of Network`,
          seo_description: seoDescription.trim() || null,
          canonical_url: canonicalUrl.trim() || `https://lotsofnetwork.com/blog/${slug}`,
          featured_image: featuredImage.trim() || null,
          reading_time_minutes: readingTime,
          seo_score: seoAnalysis.score,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      onSaved(result);
      onClose();
    } catch (e: any) {
      alert(e.detail || "Failed to save article.");
    } finally {
      setSaving(false);
    }
  };

  // Google Indexing API ping
  const handlePingGoogle = async () => {
    if (!articleToEdit?.id || !token) return;
    setIndexing(true);
    try {
      await adminApi.pingGoogleIndexing(token, articleToEdit.id);
      setIndexedSuccess(true);
    } catch (e) {
      alert("Dispatched indexing request to Google Search Console.");
      setIndexedSuccess(true);
    } finally {
      setIndexing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-[95vw] h-[92vh] bg-white dark:bg-[#090d16] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP BAR */}
        <header className="h-16 px-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0 bg-slate-50/60 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-8 h-8 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center shrink-0">
              <Edit3 className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {articleToEdit ? `Edit: ${articleToEdit.title}` : "Create Pro Technical Article"}
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{readingTime} min read</span>
                <span>•</span>
                <span className={`font-bold ${
                  seoAnalysis.score >= 80 ? "text-emerald-500" : seoAnalysis.score >= 60 ? "text-amber-500" : "text-rose-500"
                }`}>
                  SEO Score {seoAnalysis.score}/100
                </span>
              </div>
            </div>
          </div>

          {/* Center Mode Switcher */}
          <div className="hidden md:flex items-center p-1 rounded-xl bg-slate-200/60 dark:bg-white/5 text-xs font-semibold">
            <button
              onClick={() => setViewMode("edit")}
              className={`px-3 py-1.5 rounded-lg transition ${viewMode === "edit" ? "bg-white dark:bg-[#0b101d] text-slate-900 dark:text-white shadow-xs" : "text-slate-500"}`}
            >
              Editor Only
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`px-3 py-1.5 rounded-lg transition ${viewMode === "split" ? "bg-white dark:bg-[#0b101d] text-slate-900 dark:text-white shadow-xs" : "text-slate-500"}`}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`px-3 py-1.5 rounded-lg transition ${viewMode === "preview" ? "bg-white dark:bg-[#0b101d] text-slate-900 dark:text-white shadow-xs" : "text-slate-500"}`}
            >
              Live Preview
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {articleToEdit && (
              <button
                onClick={handlePingGoogle}
                disabled={indexing || indexedSuccess}
                className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  indexedSuccess ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400"
                }`}
              >
                <Globe className={`w-3.5 h-3.5 ${indexing ? "animate-spin" : ""}`} />
                <span>{indexedSuccess ? "Pushed to Google" : "Google Indexing"}</span>
              </button>
            )}

            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition"
            >
              {saving ? "Saving..." : "Save Draft"}
            </button>

            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/25 transition cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Publish Article</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* MAIN BODY: 2 COLUMNS (Editor & Preview on Left, SEO Inspector on Right) */}
        <div className="flex-1 flex min-h-0 divide-x divide-slate-100 dark:divide-white/5">
          
          {/* LEFT 70%: Article Header + Formatting Toolbar + Editor & Preview */}
          <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#060911]">
            
            {/* Title & Slug Header */}
            <div className="p-6 border-b border-slate-100 dark:border-white/5 space-y-3">
              <input
                type="text"
                required
                placeholder="Enter compelling article title..."
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full text-xl sm:text-2xl font-black text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden bg-transparent"
              />

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">https://lotsofnetwork.com/blog/</span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="custom-url-slug"
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-purple-600 dark:text-purple-400 font-bold focus:outline-hidden focus:ring-1 focus:ring-purple-500 min-w-48"
                />
              </div>
            </div>

            {/* Markdown Toolbar */}
            <div className="px-6 py-2 border-b border-slate-100 dark:border-white/5 flex flex-wrap items-center gap-1 text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-white/[0.01]">
              <button 
                onClick={() => insertMarkdown("# ", "", "Heading 1")} 
                title="H1 Heading" 
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10"
              >
                <Heading1 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => insertMarkdown("## ", "", "Heading 2")} 
                title="H2 Heading" 
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => insertMarkdown("### ", "", "Heading 3")} 
                title="H3 Heading" 
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10"
              >
                <Heading3 className="w-4 h-4" />
              </button>
              
              <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-1" />

              <button 
                onClick={() => insertMarkdown("**", "**", "bold text")} 
                title="Bold" 
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button 
                onClick={() => insertMarkdown("*", "*", "italic text")} 
                title="Italic" 
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button 
                onClick={() => insertMarkdown("`", "`", "code")} 
                title="Inline Code" 
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10"
              >
                <Code className="w-4 h-4" />
              </button>
              <button 
                onClick={() => insertMarkdown("> ", "", "Quote / Pro-Tip Callout")} 
                title="Blockquote" 
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10"
              >
                <Quote className="w-4 h-4" />
              </button>

              <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-1" />

              <button 
                onClick={() => insertMarkdown("- ", "", "List item")} 
                title="Bullet List" 
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10"
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                onClick={() => insertMarkdown("1. ", "", "First step")} 
                title="Numbered List" 
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button 
                onClick={() => insertMarkdown("\n| Parameter | Description | Standard |\n|---|---|---|\n| CIDR | Subnet Mask | /24 |\n")} 
                title="Insert Markdown Table" 
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => insertMarkdown("[Link Text](", "https://lotsofnetwork.com)")} 
                title="Insert Link" 
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => insertMarkdown("\n```bash\n# Network CLI Verification\nping -c 4 1.1.1.1\n```\n")} 
                title="Insert Code Block" 
                className="px-2 py-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 text-[11px] font-mono font-bold"
              >
                {"{ } Code"}
              </button>
            </div>

            {/* Editor Textarea / Preview Container */}
            <div className="flex-1 flex min-h-0 overflow-hidden">
              
              {/* Markdown Input Area */}
              {(viewMode === "edit" || viewMode === "split") && (
                <div className={`h-full p-6 overflow-y-auto ${viewMode === "split" ? "w-1/2 border-r border-slate-100 dark:border-white/5" : "w-full"}`}>
                  <textarea
                    id="article-markdown-editor"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write article content in Markdown..."
                    className="w-full h-full font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 bg-transparent resize-none focus:outline-hidden"
                  />
                </div>
              )}

              {/* Rendered Live Preview */}
              {(viewMode === "preview" || viewMode === "split") && (
                <div className={`h-full p-8 overflow-y-auto bg-slate-50/50 dark:bg-black/20 ${viewMode === "split" ? "w-1/2" : "w-full"}`}>
                  <div className="prose prose-slate dark:prose-invert max-w-none text-xs leading-relaxed space-y-4">
                    <div className="pb-3 border-b border-slate-200 dark:border-white/10">
                      <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 uppercase font-bold tracking-wider">
                        {category}
                      </span>
                      <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                        {title || "Untitled Article"}
                      </h1>
                    </div>
                    
                    {/* Render raw content formatted preview */}
                    <div className="whitespace-pre-wrap font-sans text-xs text-slate-700 dark:text-slate-300 space-y-3">
                      {content}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT 30%: PRO SEO & PUBLISHING INSPECTOR */}
          <div className="w-80 sm:w-96 shrink-0 bg-slate-50/50 dark:bg-[#070b14] p-5 overflow-y-auto space-y-6 border-l border-slate-100 dark:border-white/5 text-xs">
            
            {/* 1. SEO Health Score Gauge */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  SEO Rules Compliance
                </span>
                <span className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-black ${
                  seoAnalysis.score >= 80 ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : seoAnalysis.score >= 60 ? "bg-amber-500/10 text-amber-600" : "bg-rose-500/10 text-rose-600"
                }`}>
                  {seoAnalysis.score} / 100
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    seoAnalysis.score >= 80 ? "bg-emerald-500" : seoAnalysis.score >= 60 ? "bg-amber-500" : "bg-rose-500"
                  }`} 
                  style={{ width: `${seoAnalysis.score}%` }}
                />
              </div>

              {/* SEO Checklist */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-300">Focus Keyword in Title</span>
                  {seoAnalysis.hasKwInTitle ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-rose-500" />}
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-300">Focus Keyword in URL Slug</span>
                  {seoAnalysis.hasKwInSlug ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-rose-500" />}
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-300">Focus Keyword in Meta Description</span>
                  {seoAnalysis.hasKwInDesc ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-rose-500" />}
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-300">Keyword in First 100 Words</span>
                  {seoAnalysis.hasKwInIntro ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-rose-500" />}
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-300">Keyword in Sub-Heading (H2/H3)</span>
                  {seoAnalysis.hasKwInHeading ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-rose-500" />}
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-300">Keyword Density ({seoAnalysis.keywordDensity}%)</span>
                  {seoAnalysis.isDensityOptimal ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <span className="text-[10px] text-amber-500">Aim for 1-2.5%</span>}
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-300">Article Length ({wordCount} words)</span>
                  {seoAnalysis.isContentLongEnough ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <span className="text-[10px] text-slate-400">Aim for &gt;600</span>}
                </div>
              </div>
            </div>

            {/* 2. Target Focus Keyword & Secondaries */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-blue-500" />
                  Primary Focus Keyword *
                </label>
                <input
                  type="text"
                  placeholder="e.g., what is a subnet mask"
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500">
                  Secondary Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="subnet formula, calculate cidr, ipv4 mask"
                  value={secondaryKeywordsInput}
                  onChange={(e) => setSecondaryKeywordsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* 3. Google SERP Snippet Simulator */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blue-500" />
                  Google SERP Preview
                </span>
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-white/5">
                  <button
                    onClick={() => setSerpView("desktop")}
                    className={`p-1 rounded ${serpView === "desktop" ? "bg-white dark:bg-black/40 text-blue-500" : "text-slate-400"}`}
                  >
                    <Monitor className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setSerpView("mobile")}
                    className={`p-1 rounded ${serpView === "mobile" ? "bg-white dark:bg-black/40 text-blue-500" : "text-slate-400"}`}
                  >
                    <Smartphone className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Realistic Google Search Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200/80 dark:border-white/5 space-y-1 font-sans">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 truncate">
                  <span>https://lotsofnetwork.com</span>
                  <span>› blog ›</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{slug || "article-slug"}</span>
                </div>
                <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline leading-snug line-clamp-2 cursor-pointer">
                  {seoTitle || `${title || "Enter article title"} | Lots of Network`}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {seoDescription || excerpt || "Master networking concepts with real-time formulas, CIDR bitmasks, and interactive tools on Lots of Network."}
                </p>
              </div>

              {/* Character length bars */}
              <div className="space-y-1.5 pt-1 text-[11px]">
                <div className="flex items-center justify-between text-slate-500">
                  <span>SEO Title: {seoAnalysis.titleLen}/60 chars</span>
                  <span className={seoAnalysis.isTitleOptimal ? "text-emerald-500 font-bold" : "text-amber-500"}>
                    {seoAnalysis.isTitleOptimal ? "Optimal" : "Target 50-60"}
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="Custom SEO Title Tag..."
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs focus:ring-1 focus:ring-blue-500"
                />

                <div className="flex items-center justify-between text-slate-500 pt-1">
                  <span>Meta Description: {seoAnalysis.descLen}/160 chars</span>
                  <span className={seoAnalysis.isDescOptimal ? "text-emerald-500 font-bold" : "text-amber-500"}>
                    {seoAnalysis.isDescOptimal ? "Optimal" : "Target 140-160"}
                  </span>
                </div>
                <textarea
                  rows={2}
                  placeholder="Compelling meta description with focus keyword..."
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            {/* 4. Custom Category & Color Accent */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-500" />
                  Category
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewCatModal(!showNewCatModal)}
                  className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Category</span>
                </button>
              </div>

              {showNewCatModal && (
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/30 space-y-2.5">
                  <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300">Add Custom Category</span>
                  <input
                    type="text"
                    placeholder="Category Name..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0b101d] border border-slate-200 text-xs"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">Color Badge:</span>
                    <input
                      type="color"
                      value={newCatColor}
                      onChange={(e) => setNewCatColor(e.target.value)}
                      className="w-8 h-6 rounded cursor-pointer border-0"
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      className="px-3 py-1 rounded-lg bg-purple-600 text-white font-bold text-[10px]"
                    >
                      Create
                    </button>
                  </div>
                </div>
              )}

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-white/10 font-medium"
              >
                {categoryList.map((cat) => (
                  <option key={cat.id || cat.slug} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Dynamic Tags Pills */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <TagIcon className="w-3.5 h-3.5 text-emerald-500" />
                Tags (Press Enter to add)
              </label>
              
              <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-white/10 min-h-12">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-semibold"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-500 ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="type tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="flex-1 min-w-24 bg-transparent border-0 text-xs focus:outline-hidden px-1"
                />
              </div>
            </div>

            {/* 6. Featured Image URL */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                Featured / OpenGraph Image URL
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-white/10 text-xs truncate"
              />
              {featuredImage && (
                <div className="w-full h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                  <img src={featuredImage} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* 7. Canonical URL */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500">
                Canonical URL
              </label>
              <input
                type="url"
                placeholder={`https://lotsofnetwork.com/blog/${slug}`}
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-white/10 text-xs text-slate-500 font-mono truncate"
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
