"use client";

import { useState, useEffect, useCallback } from "react";
import { useNoteSections } from "@/lib/hooks/use-note-sections";
import { useNotePages } from "@/lib/hooks/use-note-pages";
import { SectionsPanel } from "@/components/notes/sections-panel";
import { PagesPanel } from "@/components/notes/pages-panel";
import { NoteEditor } from "@/components/notes/note-editor";

export function NotesView() {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(false);

  const { sections, loading: sectionsLoading, createSection, renameSection, deleteSection, refetch: refetchSections } = useNoteSections();
  const { pages, loading: pagesLoading, createPage, updatePage, updatePageDebounced, deletePage } = useNotePages(selectedSectionId);

  // Seed default section on first use
  useEffect(() => {
    if (sectionsLoading || seeded) return;
    if (sections.length === 0) {
      (async () => {
        const section = await createSection("Personal");
        if (section) {
          setSelectedSectionId(section.id);
        }
        setSeeded(true);
      })();
    } else {
      setSeeded(true);
    }
  }, [sectionsLoading, sections.length, seeded, createSection]);

  // After seeding a section, create a welcome page once pages load for it
  useEffect(() => {
    if (seeded && selectedSectionId && !pagesLoading && pages.length === 0 && sections.length === 1) {
      (async () => {
        const page = await createPage("Welcome");
        if (page) {
          await updatePage(page.id, {
            content: "Welcome to Notes! Create sections to organize your notes, and pages within each section.",
          });
          setSelectedPageId(page.id);
        }
      })();
    }
  }, [seeded, selectedSectionId, pagesLoading, pages.length, sections.length, createPage, updatePage]);

  // Auto-select first section
  useEffect(() => {
    if (sections.length > 0 && !selectedSectionId) {
      setSelectedSectionId(sections[0].id);
    }
  }, [sections, selectedSectionId]);

  // Auto-select first page when section changes
  useEffect(() => {
    if (pages.length > 0 && !pages.find(p => p.id === selectedPageId)) {
      setSelectedPageId(pages[0].id);
    }
  }, [pages, selectedPageId]);

  // Clear page selection when section changes
  const handleSelectSection = useCallback((id: string) => {
    setSelectedSectionId(id);
    setSelectedPageId(null);
  }, []);

  const handleCreatePage = useCallback(async () => {
    const page = await createPage("Untitled");
    if (page) setSelectedPageId(page.id);
  }, [createPage]);

  const handleDeleteSection = useCallback(async (id: string) => {
    await deleteSection(id);
    if (selectedSectionId === id) {
      setSelectedSectionId(null);
      setSelectedPageId(null);
    }
  }, [deleteSection, selectedSectionId]);

  const handleDeletePage = useCallback(async (id: string) => {
    await deletePage(id);
    if (selectedPageId === id) {
      setSelectedPageId(null);
    }
  }, [deletePage, selectedPageId]);

  const selectedPage = pages.find((p) => p.id === selectedPageId) ?? null;

  if (sectionsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-stone-400 text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-1 h-full">
      <SectionsPanel
        sections={sections}
        selectedId={selectedSectionId}
        onSelect={handleSelectSection}
        onCreate={(name) => createSection(name)}
        onRename={renameSection}
        onDelete={handleDeleteSection}
      />
      <PagesPanel
        pages={pages}
        selectedId={selectedPageId}
        onSelect={setSelectedPageId}
        onCreate={handleCreatePage}
        onDelete={handleDeletePage}
        sectionSelected={!!selectedSectionId}
      />
      <NoteEditor
        page={selectedPage}
        onUpdateDebounced={updatePageDebounced}
      />
    </div>
  );
}
