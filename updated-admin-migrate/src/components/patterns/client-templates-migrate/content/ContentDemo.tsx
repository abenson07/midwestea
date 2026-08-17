"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useFaqs, usePeople, useStories, useBanners, useDemoGuard } from "hooks";
import { supabaseClient } from "@/lib/supabaseClient";
import type { BannerWriteInput } from "@/lib/webflow/banners";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { VStack } from "@/components/patterns/primitives/Stack";
import { Text } from "@/components/patterns/primitives/Text";
import { StoryCard } from "./StoryCard";
import { FaqCard } from "./FaqCard";
import { BannerCard } from "./BannerCard";
import { StoryFormPanel } from "./StoryFormPanel";
import { FaqFormPanel } from "./FaqFormPanel";
import { BannerFormPanel } from "./BannerFormPanel";
import type { Banner, Faq, Story } from "./types";
import { bannerIsCurrentlyActive, contentStatusToStoryStatus, toBanner, toFaq, toStory } from "./adapters";
import { sampleStories } from "@/data/mocks/content";

type ContentView = "stories" | "faqs" | "banners";

function isContentView(value: string | null): value is ContentView {
  return value === "stories" || value === "faqs" || value === "banners";
}

function emptyStory(currentUser: { id: string; name: string } | null): Story {
  return {
    id: "",
    title: "",
    author: currentUser?.name ?? "—",
    authorId: currentUser?.id ?? null,
    status: "Draft",
    publishedAt: null,
    body: "",
  };
}

function emptyFaq(): Faq {
  return { id: "", question: "", answer: "", pages: [] };
}

function emptyBanner(): Banner {
  return { id: "", title: "", ctaText: "", link: "", active: true, expiresAt: null };
}

function ContentDemoInner() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("view");
  const [view, setView] = useState<ContentView>(isContentView(initial) ? initial : "stories");

  const {
    stories: storyRows,
    loading: storiesLoading,
    error: storiesError,
    create: createStory,
    update: updateStory,
  } = useStories();
  const {
    faqs: faqRows,
    loading: faqsLoading,
    error: faqsError,
    create: createFaq,
    update: updateFaq,
    togglePage,
  } = useFaqs();
  const {
    banners: bannerRows,
    loading: bannersLoading,
    error: bannersError,
    create: createBanner,
    update: updateBanner,
  } = useBanners();
  const { people } = usePeople();
  const { enabled: demo, store } = useDemoGuard();

  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
  useEffect(() => {
    let cancelled = false;
    async function resolve() {
      if (!supabaseClient) return;
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();
      if (cancelled || !user?.email) return;
      const match = people.find((p) => p.email === user.email);
      if (match && !cancelled) setCurrentUser({ id: match.id, name: match.full_name });
    }
    resolve();
    return () => {
      cancelled = true;
    };
  }, [people]);

  const authorNameById = useMemo(() => new Map(people.map((p) => [p.id, p.full_name])), [people]);
  const stories: Story[] = useMemo(() => {
    if (demo) {
      const seed = sampleStories.map(
        (s): Story => ({
          id: s.id,
          title: s.title,
          author: s.author,
          authorId: null,
          status: s.status,
          publishedAt: s.publishedAt,
          body: s.body,
          imageUrl: s.imageUrl,
          description: s.description,
        }),
      );
      return store.merge<Story>("stories", seed);
    }
    return storyRows.map((row) => toStory(row, authorNameById));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, storyRows, authorNameById, store.version]);
  const faqs: Faq[] = useMemo(() => {
    const base = faqRows.map(toFaq);
    return demo ? store.merge<Faq>("faqs", base) : base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, faqRows, store.version]);
  const banners: Banner[] = useMemo(() => {
    const base = bannerRows.map(toBanner);
    return demo ? store.merge<Banner>("banners", base) : base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, bannerRows, store.version]);
  const activeBanners = useMemo(() => banners.filter((b) => bannerIsCurrentlyActive(b)), [banners]);
  const inactiveBanners = useMemo(() => banners.filter((b) => !bannerIsCurrentlyActive(b)), [banners]);

  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  function changeView(next: ContentView) {
    setView(next);
    setEditingStory(null);
    setEditingFaq(null);
    setEditingBanner(null);
    setIsCreatingNew(false);
  }

  function closeDetail() {
    setEditingStory(null);
    setEditingFaq(null);
    setEditingBanner(null);
    setIsCreatingNew(false);
  }

  function startCreate() {
    setIsCreatingNew(true);
    if (view === "stories") setEditingStory(emptyStory(currentUser));
    else if (view === "faqs") setEditingFaq(emptyFaq());
    else setEditingBanner(emptyBanner());
  }

  async function handleSaveStory(updated: Story) {
    if (demo) {
      const id = updated.id || `story-${Date.now().toString(36)}`;
      store.upsert("stories", { ...updated, id });
      toast.success(
        `${updated.id ? "Story updated" : "Story created"} — demo mode, saved locally only`,
      );
      closeDetail();
      return;
    }
    if (!updated.id) {
      await createStory({
        title: updated.title,
        author_id: updated.authorId,
        status: contentStatusToStoryStatus(updated.status),
        body: updated.body,
      });
    } else {
      await updateStory(updated.id, {
        title: updated.title,
        body: updated.body,
        status: contentStatusToStoryStatus(updated.status),
      });
    }
    closeDetail();
  }

  async function handleSaveFaq(updated: Faq) {
    if (demo) {
      const id = updated.id || `faq-${Date.now().toString(36)}`;
      store.upsert("faqs", { ...updated, id });
      toast.success(`${updated.id ? "FAQ updated" : "FAQ created"} — demo mode, saved locally only`);
      closeDetail();
      return;
    }
    if (!updated.id) {
      const created = await createFaq({ question: updated.question, answer: updated.answer });
      if (created) {
        await Promise.all(updated.pages.map((slug) => togglePage(created.id, slug, true)));
      }
    } else {
      await updateFaq(updated.id, { question: updated.question, answer: updated.answer });
      const before = editingFaq?.pages ?? [];
      const added = updated.pages.filter((slug) => !before.includes(slug));
      const removed = before.filter((slug) => !updated.pages.includes(slug));
      await Promise.all([
        ...added.map((slug) => togglePage(updated.id, slug, true)),
        ...removed.map((slug) => togglePage(updated.id, slug, false)),
      ]);
    }
    closeDetail();
  }

  async function handleSaveBanner(updated: Banner) {
    if (demo) {
      const id = updated.id || `banner-${Date.now().toString(36)}`;
      store.upsert("banners", { ...updated, id });
      toast.success(
        `${updated.id ? "Banner updated" : "Banner created"} — demo mode, saved locally only`,
      );
      closeDetail();
      return;
    }
    const input: BannerWriteInput = {
      name: updated.title,
      message: updated.ctaText,
      linkUrl: updated.link,
      active: updated.active,
      expiresAt: updated.expiresAt,
      urgent: false,
      editorNotes: "",
    };
    if (!updated.id) {
      await createBanner(input);
    } else {
      await updateBanner(updated.id, input);
    }
    closeDetail();
  }

  const viewLabel = view === "stories" ? "story" : view === "faqs" ? "FAQ" : "banner";
  const isDetailView = editingStory != null || editingFaq != null || editingBanner != null;
  const loading =
    demo ? false : view === "stories" ? storiesLoading : view === "faqs" ? faqsLoading : bannersLoading;
  const error =
    demo ? null : view === "stories" ? storiesError : view === "faqs" ? faqsError : bannersError;

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        contentMaxWidth={760}
        header={
          <CanvasHeader
            topbar={
              isDetailView
                ? {
                    title: isCreatingNew
                      ? view === "stories"
                        ? "New story"
                        : view === "faqs"
                          ? "New FAQ"
                          : "New banner"
                      : view === "stories"
                        ? "Story"
                        : view === "faqs"
                          ? "FAQ"
                          : "Banner",
                    breadcrumbs: [{ label: "Content", onClick: closeDetail }],
                  }
                : { title: "Content" }
            }
            controls={
              isDetailView ? undefined : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                  <ViewTabs aria-label="Content views">
                    <ViewTab
                      label="Stories"
                      selected={view === "stories"}
                      onClick={() => changeView("stories")}
                    />
                    <ViewTab label="FAQs" selected={view === "faqs"} onClick={() => changeView("faqs")} />
                    <ViewTab
                      label="Banners"
                      selected={view === "banners"}
                      onClick={() => changeView("banners")}
                    />
                  </ViewTabs>
                  <button
                    type="button"
                    onClick={startCreate}
                    aria-label={`New ${viewLabel}`}
                    style={{
                      all: "unset",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      height: 28,
                      paddingInline: 10,
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      color: "var(--linear-color-ink)",
                      background: "var(--linear-color-icon-button-secondary)",
                      border: "var(--linear-border-width) solid var(--linear-color-hairline)",
                    }}
                  >
                    <Plus size={14} strokeWidth={1.75} />
                    {`New ${viewLabel}`}
                  </button>
                </div>
              )
            }
            isControlsVisible={!isDetailView}
          />
        }
      >
        <div style={{ height: "100%", padding: isDetailView ? "24px 0" : "16px 0" }}>
          {editingStory ? (
            <StoryFormPanel
              story={editingStory}
              isNew={isCreatingNew}
              onClose={closeDetail}
              onSave={handleSaveStory}
            />
          ) : editingFaq ? (
            <FaqFormPanel faq={editingFaq} isNew={isCreatingNew} onClose={closeDetail} onSave={handleSaveFaq} />
          ) : editingBanner ? (
            <BannerFormPanel
              banner={editingBanner}
              isNew={isCreatingNew}
              onClose={closeDetail}
              onSave={handleSaveBanner}
            />
          ) : error ? (
            <Text color="secondary">Couldn&apos;t load content: {error}</Text>
          ) : loading ? (
            <Text color="secondary">Loading…</Text>
          ) : view === "banners" ? (
            <VStack gap={4}>
              <VStack gap={2}>
                <Text weight="semibold" size="sm" color="secondary">
                  Active
                </Text>
                <VStack gap={2}>
                  {activeBanners.map((banner) => (
                    <BannerCard key={banner.id} banner={banner} onClick={() => setEditingBanner(banner)} />
                  ))}
                  {activeBanners.length === 0 ? (
                    <Text color="secondary" size="sm">
                      No active banners
                    </Text>
                  ) : null}
                </VStack>
              </VStack>
              <VStack gap={2}>
                <Text weight="semibold" size="sm" color="secondary">
                  Inactive
                </Text>
                <VStack gap={2}>
                  {inactiveBanners.map((banner) => (
                    <BannerCard key={banner.id} banner={banner} onClick={() => setEditingBanner(banner)} />
                  ))}
                  {inactiveBanners.length === 0 ? (
                    <Text color="secondary" size="sm">
                      No inactive banners
                    </Text>
                  ) : null}
                </VStack>
              </VStack>
            </VStack>
          ) : (
            <VStack gap={2}>
              {view === "stories"
                ? stories.map((story) => (
                    <StoryCard key={story.id} story={story} onClick={() => setEditingStory(story)} />
                  ))
                : faqs.map((faq) => <FaqCard key={faq.id} faq={faq} onClick={() => setEditingFaq(faq)} />)}
            </VStack>
          )}
        </div>
      </FoundationLayout>
    </div>
  );
}

export function ContentDemo() {
  return (
    <Suspense fallback={null}>
      <ContentDemoInner />
    </Suspense>
  );
}
