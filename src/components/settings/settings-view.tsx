"use client";

import { useState, useCallback } from "react";
import { useCategories } from "@/lib/hooks/use-categories";
import { usePreferences } from "@/lib/hooks/use-preferences";
import { useSupabase } from "@/lib/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, Check, X, Download, MapPin } from "lucide-react";
import { Category } from "@/types";

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IN", name: "India" },
  { code: "JP", name: "Japan" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "PL", name: "Poland" },
  { code: "AT", name: "Austria" },
  { code: "CH", name: "Switzerland" },
  { code: "IE", name: "Ireland" },
  { code: "NZ", name: "New Zealand" },
  { code: "SG", name: "Singapore" },
  { code: "KR", name: "South Korea" },
  { code: "ZA", name: "South Africa" },
];

export function SettingsView() {
  const { categories, loading, refetch } = useCategories();
  const { client, userId } = useSupabase();
  const { preferences, updatePreferences, countryCode, latitude, longitude, tempUnit } = usePreferences();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#6B7280");

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditColor("");
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim() || !client) return;
    await client
      .from("categories")
      .update({ name: editName.trim(), color: editColor })
      .eq("id", editingId);
    cancelEdit();
    refetch();
  };

  const deleteCategory = async (id: string) => {
    if (!client) return;
    await client.from("categories").delete().eq("id", id);
    refetch();
  };

  const addCategory = async () => {
    if (!newName.trim() || !client || !userId) return;
    await client.from("categories").insert({
      id: crypto.randomUUID(),
      user_id: userId,
      name: newName.trim(),
      color: newColor,
      created_at: new Date().toISOString(),
    });
    setNewName("");
    setNewColor("#6B7280");
    setAdding(false);
    refetch();
  };

  const exportData = useCallback(async () => {
    if (!client) return;

    const [categories, timeBlocks, tasks, dailyNotes, noteSections, notePages] =
      await Promise.all([
        client.from("categories").select("*"),
        client.from("time_blocks").select("*"),
        client.from("tasks").select("*"),
        client.from("daily_notes").select("*"),
        client.from("note_sections").select("*"),
        client.from("note_pages").select("*"),
      ]);

    const data = {
      categories: categories.data ?? [],
      time_blocks: timeBlocks.data ?? [],
      tasks: tasks.data ?? [],
      daily_notes: dailyNotes.data ?? [],
      note_sections: noteSections.data ?? [],
      note_pages: notePages.data ?? [],
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `day-planner-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [client]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="skeleton w-28 h-6 mb-2" />
        <div className="skeleton w-56 h-4 mb-8" />
        <div className="skeleton w-full h-64" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-lg font-semibold text-stone-800 mb-1 tracking-tight">Settings</h2>
      <p className="text-sm text-stone-500 mb-8">
        Manage your categories and event types.
      </p>

      {/* Categories Section */}
      <div className="bg-white rounded-xl border border-stone-200/80 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <div>
            <h3 className="text-sm font-semibold text-stone-800">Categories</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Color-code your events and tasks
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setAdding(true)}
          >
            <Plus size={14} />
            Add
          </Button>
        </div>

        <div className="divide-y divide-stone-100">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 px-5 py-3 group hover:bg-stone-50 transition-colors"
            >
              {editingId === cat.id ? (
                <>
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border border-stone-200"
                  />
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit();
                      if (e.key === "Escape") cancelEdit();
                    }}
                    className="flex-1 text-sm px-2 py-1 rounded border border-stone-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={saveEdit}
                    className="p-1.5 rounded-md text-green-600 hover:bg-green-50"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-1.5 rounded-md text-stone-400 hover:bg-stone-100"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <span
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="flex-1 text-sm text-stone-800">
                    {cat.name}
                  </span>
                  <span className="text-xs text-stone-400 font-mono">
                    {cat.color}
                  </span>
                  <button
                    onClick={() => startEdit(cat)}
                    className="p-1.5 rounded-md text-stone-300 hover:text-stone-600 hover:bg-stone-100 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="p-1.5 rounded-md text-stone-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          ))}

          {/* Add new category row */}
          {adding && (
            <div className="flex items-center gap-3 px-5 py-3 bg-stone-50">
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-7 h-7 rounded cursor-pointer border border-stone-200"
              />
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addCategory();
                  if (e.key === "Escape") {
                    setAdding(false);
                    setNewName("");
                  }
                }}
                placeholder="Category name"
                className="flex-1 text-sm px-2 py-1 rounded border border-stone-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={addCategory}
                className="p-1.5 rounded-md text-green-600 hover:bg-green-50"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => {
                  setAdding(false);
                  setNewName("");
                }}
                className="p-1.5 rounded-md text-stone-400 hover:bg-stone-100"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {categories.length === 0 && !adding && (
            <div className="px-5 py-10 text-center">
              <p className="text-sm font-medium text-stone-500">No categories yet</p>
              <p className="text-xs text-stone-400 mt-1">Add one to color-code your events</p>
            </div>
          )}
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-white rounded-xl border border-stone-200/80 shadow-sm mt-6">
        <div className="px-5 py-4 border-b border-stone-200">
          <h3 className="text-sm font-semibold text-stone-800">Preferences</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Configure holidays, weather, and display
          </p>
        </div>
        <div className="px-5 py-4 space-y-5">
          {/* Country for holidays */}
          <div>
            <label className="text-xs font-medium text-stone-600 block mb-1.5">
              Holiday country
            </label>
            <select
              value={countryCode}
              onChange={(e) => updatePreferences({ country_code: e.target.value })}
              className="text-sm border border-stone-200 rounded-lg px-3 py-2 bg-white w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Temperature unit */}
          <div>
            <label className="text-xs font-medium text-stone-600 block mb-1.5">
              Temperature unit
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => updatePreferences({ temp_unit: "celsius" })}
                className={`text-sm px-4 py-1.5 rounded-lg border transition-colors ${
                  tempUnit === "celsius"
                    ? "bg-stone-800 text-white border-stone-800"
                    : "border-stone-200 text-stone-600 hover:bg-stone-50"
                }`}
              >
                °C
              </button>
              <button
                onClick={() => updatePreferences({ temp_unit: "fahrenheit" })}
                className={`text-sm px-4 py-1.5 rounded-lg border transition-colors ${
                  tempUnit === "fahrenheit"
                    ? "bg-stone-800 text-white border-stone-800"
                    : "border-stone-200 text-stone-600 hover:bg-stone-50"
                }`}
              >
                °F
              </button>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-xs font-medium text-stone-600 block mb-1.5">
              Weather location
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400 tabular-nums">
                {latitude.toFixed(2)}, {longitude.toFixed(2)}
              </span>
              <button
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        updatePreferences({
                          latitude: pos.coords.latitude,
                          longitude: pos.coords.longitude,
                        });
                      },
                      () => {
                        // Keep current location
                      }
                    );
                  }
                }}
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
              >
                <MapPin size={12} />
                Update location
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-xl border border-stone-200/80 shadow-sm mt-6">
        <div className="px-5 py-4 border-b border-stone-200">
          <h3 className="text-sm font-semibold text-stone-800">Data</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Export all your planner data as a JSON backup
          </p>
        </div>
        <div className="px-5 py-4">
          <Button variant="secondary" size="sm" onClick={exportData}>
            <Download size={14} />
            Export All Data
          </Button>
          <p className="text-xs text-stone-400 mt-2">
            To restore, go to Import &rarr; Backup (.json)
          </p>
        </div>
      </div>
    </div>
  );
}
