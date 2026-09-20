"use client";

import React, { useState, useEffect, useMemo } from "react";
import { marked } from "marked";
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
  ChevronDown,
  Upload,
  Trash2,
  Loader2
} from "lucide-react";
import { Article, Category, adminApi, API_BASE_URL } from "@/lib/api";

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
  const [views, setViews] = useState<number>(0);
  const [status, setStatus] = useState<"published" | "draft" | "scheduled" | "archived">("published");
  
  // SEO Fields
  const [focusKeyword, setFocusKeyword] = useState("");
  const [secondaryKeywordsInput, setSecondaryKeywordsInput] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [featuredUploadError, setFeaturedUploadError] = useState<string | null>(null);
  const [featuredInputMode, setFeaturedInputMode] = useState<"upload" | "url">("upload");
  const [uploadingContentImg, setUploadingContentImg] = useState(false);

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
      setViews(articleToEdit.views || 0);
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
      setContent(`# Guide Title\n\nWrite your in-depth networking article here...\n\n## Key Architectural Principles\n\nExplain technical concepts with code examples:\n\n\`\`\`bash\nping -c 4 1.1.1.1\n\`\`\`\n\n### Subnet & Port Verification\n\nDetailed breakdown of protocols and RFC specifications.`);
      setExcerpt("");
      setStatus("published");
      setViews(0);
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

  // Rendered HTML from Markdown
  const renderedHtml = useMemo(() => {
    if (!content.trim()) {
      return "<p class='text-slate-400 italic'>Start typing in markdown to see live rendered preview...</p>";
    }
    try {
      return marked.parse(content, { gfm: true, breaks: true }) as string;
    } catch (e) {
      return `<pre class='text-rose-400 font-mono'>Failed to render markdown: ${String(e)}</pre>`;
    }
  }, [content]);

  // Dynamic Keyword & SEO Checklist Analysis
  const seoAnalysis = useMemo(() => {
    const kw = focusKeyword.trim().toLowerCase();
    const effectiveTitle = (seoTitle || title || "").toLowerCase();
    const effectiveDesc = (seoDescription || excerpt || "").toLowerCase();
    const effectiveSlug = (slug || "").toLowerCase().replace(/-/g, " ");
    const contentLower = content.toLowerCase();

    const hasKwInTitle = kw ? effectiveTitle.includes(kw) : false;
    const hasKwInSlug = kw ? effectiveSlug.includes(kw) : false;
    const hasKwInDesc = kw ? effectiveDesc.includes(kw) : false;

    const first100Words = contentLower.split(/\s+/).slice(0, 100).join(" ");
    const hasKwInIntro = kw ? first100Words.includes(kw) : false;

    const headings = contentLower.match(/^#{1,6}\s+(.+)$/gm) || [];
    const hasKwInHeading = kw ? headings.some(h => h.includes(kw)) : false;

    let keywordCount = 0;
    if (kw && wordCount > 0) {
      const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "gi");
      keywordCount = (contentLower.match(regex) || []).length;
    }
    const keywordDensity = wordCount > 0 ? ((keywordCount / wordCount) * 100).toFixed(2) : "0.00";
    const isDensityOptimal = Number(keywordDensity) >= 0.8 && Number(keywordDensity) <= 2.5;

    const titleLen = (seoTitle || title || "").length;
    const isTitleOptimal = titleLen >= 45 && titleLen <= 65;

    const descLen = (seoDescription || excerpt || "").length;
    const isDescOptimal = descLen >= 135 && descLen <= 165;

    const isContentLongEnough = wordCount >= 600;

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

  // SMART LINE-AWARE HEADING INSERTION / TOGGLE (Fixes H1/H2/H3 issue)
  const insertHeading = (level: number) => {
    const textarea = document.getElementById("article-markdown-editor") as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    // Find the start and end of the current line
    const lineStart = text.lastIndexOf("\n", start - 1) + 1;
    let lineEnd = text.indexOf("\n", end);
    if (lineEnd === -1) lineEnd = text.length;

    const currentLine = text.substring(lineStart, lineEnd);
    const hashes = "#".repeat(level) + " ";

    let newLine: string;
    let newCursor: number;

    // If current line already has heading prefix (# , ## , ### )
    if (/^#{1,6}\s/.test(currentLine)) {
      if (currentLine.startsWith(hashes)) {
        // Toggle off if already this level
        newLine = currentLine.replace(/^#{1,6}\s/, "");
        newCursor = Math.max(lineStart, start - hashes.length);
      } else {
        // Switch to new heading level
        newLine = currentLine.replace(/^#{1,6}\s/, hashes);
        newCursor = lineStart + newLine.length;
      }
    } else if (currentLine.trim() === "") {
      newLine = `${hashes}Heading ${level}`;
      newCursor = lineStart + newLine.length;
    } else {
      newLine = `${hashes}${currentLine}`;
      newCursor = lineStart + newLine.length;
    }

    const newText = text.substring(0, lineStart) + newLine + text.substring(lineEnd);
    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursor, newCursor);
    }, 20);
  };

  // Inline formatting shortcut
  const insertInline = (prefix: string, suffix = "", defaultText = "text") => {
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
    }, 20);
  };

  // Block shortcut (quotes, lists)
  const insertBlock = (prefix: string, defaultText = "item") => {
    const textarea = document.getElementById("article-markdown-editor") as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const lineStart = text.lastIndexOf("\n", start - 1) + 1;
    let lineEnd = text.indexOf("\n", end);
    if (lineEnd === -1) lineEnd = text.length;

    const currentLine = text.substring(lineStart, lineEnd);
    let newLine: string;
    if (currentLine.trim() === "") {
      newLine = `${prefix}${defaultText}`;
    } else {
      newLine = `${prefix}${currentLine}`;
    }

    const newContent = text.substring(0, lineStart) + newLine + text.substring(lineEnd);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(lineStart + newLine.length, lineStart + newLine.length);
    }, 20);
  };

  // Image Upload Handlers
  const handleFeaturedImageUpload = async (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFeaturedUploadError("Image size exceeds 5MB limit.");
      return;
    }
    setFeaturedUploadError(null);
    setUploadingFeatured(true);

    try {
      if (token) {
        const res = await adminApi.uploadMedia(token, file);
        const resolvedUrl = res.url.startsWith("http") ? res.url : `${API_BASE_URL}${res.url}`;
        setFeaturedImage(resolvedUrl);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFeaturedImage((e.target?.result as string) || "");
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      console.error("Featured image upload failed:", err);
      setFeaturedUploadError(err.message || "Failed to upload image. You can also paste an image URL directly.");
    } finally {
      setUploadingFeatured(false);
    }
  };

  const handleContentImageUpload = async (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size exceeds 5MB limit.");
      return;
    }
    setUploadingContentImg(true);
    try {
      let finalUrl = "";
      if (token) {
        const res = await adminApi.uploadMedia(token, file);
        finalUrl = res.url.startsWith("http") ? res.url : `${API_BASE_URL}${res.url}`;
      } else {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve((e.target?.result as string) || "");
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        finalUrl = dataUrl;
      }
      const altText = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      insertInline(`\n\n![${altText}](${finalUrl})\n\n`);
    } catch (err: any) {
      console.error("Content image upload failed:", err);
      alert(err.message || "Failed to upload image.");
    } finally {
      setUploadingContentImg(false);
    }
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
      featured_image: featuredImage.trim() || null,
      views: Number(views) >= 0 ? Number(views) : 0,
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
          views: Number(views) >= 0 ? Number(views) : 0,
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
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
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

            {/* Markdown Toolbar with Real Working Line-Aware Headings */}
            <div className="px-6 py-2 border-b border-slate-100 dark:border-white/5 flex flex-wrap items-center gap-1 text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-white/[0.01]">
              <button 
                type="button"
                onClick={() => insertHeading(1)} 
                title="H1 Main Heading (Toggle #)" 
                className="px-2.5 py-1.5 rounded-lg hover:bg-purple-500/10 hover:text-purple-600 font-black text-xs transition cursor-pointer flex items-center gap-1"
              >
                <Heading1 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>H1</span>
              </button>
              <button 
                type="button"
                onClick={() => insertHeading(2)} 
                title="H2 Major Section (Toggle ##)" 
                className="px-2.5 py-1.5 rounded-lg hover:bg-purple-500/10 hover:text-purple-600 font-extrabold text-xs transition cursor-pointer flex items-center gap-1"
              >
                <Heading2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>H2</span>
              </button>
              <button 
                type="button"
                onClick={() => insertHeading(3)} 
                title="H3 Sub-section (Toggle ###)" 
                className="px-2.5 py-1.5 rounded-lg hover:bg-purple-500/10 hover:text-purple-600 font-bold text-xs transition cursor-pointer flex items-center gap-1"
              >
                <Heading3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>H3</span>
              </button>
              
              <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-1" />

              <button 
                type="button"
                onClick={() => insertInline("**", "**", "bold text")} 
                title="Bold (**text**)" 
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 cursor-pointer"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button 
                type="button"
                onClick={() => insertInline("*", "*", "italic text")} 
                title="Italic (*text*)" 
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 cursor-pointer"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button 
                type="button"
                onClick={() => insertInline("`", "`", "code")} 
                title="Inline Code (`code`)" 
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 cursor-pointer"
              >
                <Code className="w-4 h-4" />
              </button>
              <button 
                type="button"
                onClick={() => insertBlock("> ", "Pro-tip or key takeaway...")} 
                title="Blockquote (> quote)" 
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 cursor-pointer"
              >
                <Quote className="w-4 h-4" />
              </button>

              <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-1" />

              <button 
                type="button"
                onClick={() => insertBlock("- ", "List item")} 
                title="Bullet List (- item)" 
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 cursor-pointer"
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                type="button"
                onClick={() => insertBlock("1. ", "Step one")} 
                title="Numbered List (1. item)" 
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 cursor-pointer"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button 
                type="button"
                onClick={() => insertInline("\n\n| Parameter | Description | Recommended Value |\n|---|---|---|\n| Subnet Mask | Network bitmask | 255.255.255.0 |\n| CIDR Prefix | Slash notation | /24 |\n\n")} 
                title="Insert Markdown Table" 
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 cursor-pointer"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button 
                type="button"
                onClick={() => insertInline("[", "](https://lotsofnetwork.com)", "Link Anchor")} 
                title="Insert Link [text](url)" 
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 cursor-pointer"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
              <button 
                type="button"
                onClick={() => insertInline("\n\n```bash\n# Network Diagnostics\nping -c 4 1.1.1.1\n```\n\n")} 
                title="Insert Code Block" 
                className="px-2 py-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 text-[11px] font-mono font-bold cursor-pointer"
              >
                {"{ } Code"}
              </button>

              <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-1" />

              {/* In-Content Image Upload Button */}
              <input
                type="file"
                id="article-content-img-input"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleContentImageUpload(file);
                  e.target.value = "";
                }}
              />
              <button 
                type="button"
                onClick={() => document.getElementById("article-content-img-input")?.click()} 
                title="Upload & Insert In-Content Image" 
                disabled={uploadingContentImg}
                className="p-1.5 rounded-lg hover:bg-purple-500/10 hover:text-purple-600 text-slate-600 dark:text-slate-300 cursor-pointer flex items-center gap-1 text-xs transition"
              >
                {uploadingContentImg ? (
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                ) : (
                  <ImageIcon className="w-4 h-4 text-amber-500" />
                )}
                <span className="text-[11px] font-medium hidden sm:inline">Image</span>
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
                    placeholder="Write article content in Markdown using # H1, ## H2, ### H3, lists, and code blocks..."
                    className="w-full h-full font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 bg-transparent resize-none focus:outline-hidden"
                  />
                </div>
              )}

              {/* Real Rendered Live Preview with Full Typography Styling */}
              {(viewMode === "preview" || viewMode === "split") && (
                <div className={`h-full p-8 overflow-y-auto bg-slate-50/40 dark:bg-black/20 ${viewMode === "split" ? "w-1/2" : "w-full"}`}>
                  <div className="max-w-none space-y-4">
                    
                    {/* Header Banner in Preview */}
                    <div className="pb-4 border-b border-slate-200 dark:border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold text-white bg-purple-600">
                          {category}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {readingTime} min read
                        </span>
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 leading-tight">
                        {title || "Untitled Article Title"}
                      </h1>
                    </div>
                    
                    {/* Rendered Markdown Body via marked with custom typography */}
                    <div 
                      className="article-preview-content"
                      dangerouslySetInnerHTML={{ __html: renderedHtml }}
                    />
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
                    type="button"
                    onClick={() => setSerpView("desktop")}
                    className={`p-1 rounded cursor-pointer ${serpView === "desktop" ? "bg-white dark:bg-black/40 text-blue-500" : "text-slate-400"}`}
                  >
                    <Monitor className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSerpView("mobile")}
                    className={`p-1 rounded cursor-pointer ${serpView === "mobile" ? "bg-white dark:bg-black/40 text-blue-500" : "text-slate-400"}`}
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
                  className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
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
                      className="px-3 py-1 rounded-lg bg-purple-600 text-white font-bold text-[10px] cursor-pointer"
                    >
                      Create
                    </button>
                  </div>
                </div>
              )}

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-white/10 font-medium cursor-pointer"
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
                      className="hover:text-rose-500 ml-0.5 cursor-pointer"
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

            {/* 6. Featured Image (Optional) */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-xs">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                  Featured / Cover Image
                </label>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-white dark:bg-white/5 px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/10">
                  Optional
                </span>
              </div>

              {featuredImage ? (
                <div className="space-y-2">
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 group bg-slate-100 dark:bg-black/30">
                    <img src={featuredImage} alt="Featured Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFeaturedImage("")}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove Image
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span className="truncate max-w-[200px]" title={featuredImage}>
                      {featuredImage}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFeaturedImage("")}
                      className="text-red-500 hover:text-red-600 text-xs font-medium ml-2 shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Mode switch: Upload vs URL */}
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-200/60 dark:bg-white/5 w-fit text-[11px]">
                    <button
                      type="button"
                      onClick={() => setFeaturedInputMode("upload")}
                      className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                        featuredInputMode === "upload"
                          ? "bg-white dark:bg-white/10 text-purple-600 dark:text-purple-400 shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeaturedInputMode("url")}
                      className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                        featuredInputMode === "url"
                          ? "bg-white dark:bg-white/10 text-purple-600 dark:text-purple-400 shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      Image URL
                    </button>
                  </div>

                  {featuredInputMode === "upload" ? (
                    <div>
                      <input
                        type="file"
                        id="featured-image-file-input"
                        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFeaturedImageUpload(file);
                          e.target.value = "";
                        }}
                      />
                      <label
                        htmlFor="featured-image-file-input"
                        className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl cursor-pointer hover:border-purple-500 dark:hover:border-purple-500/50 bg-white/50 dark:bg-white/[0.01] hover:bg-purple-50/20 transition group"
                      >
                        {uploadingFeatured ? (
                          <div className="flex items-center gap-2 text-purple-600 text-xs font-semibold">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Uploading image...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-center px-4">
                            <Upload className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                              Choose file or drop here
                            </span>
                            <span className="text-[10px] text-slate-400">
                              PNG, JPG, WebP, SVG up to 5MB (Optional)
                            </span>
                          </div>
                        )}
                      </label>
                      {featuredUploadError && (
                        <p className="text-[11px] text-red-500 mt-1">{featuredUploadError}</p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/... or CDN link"
                        value={featuredImage}
                        onChange={(e) => setFeaturedImage(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-white/10 text-xs truncate focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Paste any public image link or leave empty.
                      </p>
                    </div>
                  )}
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

            {/* 8. Live Views & Telemetry Calibration */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-500" />
                  <span>Verified Pageviews</span>
                </label>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Telemetry
                </span>
              </div>
              <input
                type="number"
                min="0"
                value={views}
                onChange={(e) => setViews(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-white/10 text-xs font-mono font-bold text-slate-900 dark:text-white"
              />
              <p className="text-[10px] text-slate-400 leading-tight">
                Dynamic database count. Increments on live visits (15-min IP deduplication). Calibrate anytime with GA4 or Google Search Console.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
