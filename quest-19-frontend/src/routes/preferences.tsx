import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, RotateCcw, Save, Settings, Trash2 } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { BaseLayout } from "@/layouts/BaseLayout";
import {
  DEFAULT_NEWS_SOURCES, PREDEFINED_CATEGORIES
} from "@/lib/constants";
import { cookieUtils, type UserPreferences } from "@/lib/cookies";

export const Route = createFileRoute("/preferences")({
  component: () => (
    <BaseLayout className="space-y-4">
      <Preferences />
    </BaseLayout>
  ),
});

const isPredefinedCategory = (category: string) => {
  return PREDEFINED_CATEGORIES.some((predefined) => predefined.id === category);
};

const getPredefinedCategory = (categoryId: string) => {
  return PREDEFINED_CATEGORIES.find((cat) => cat.id === categoryId);
};

function Preferences() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    sources: ["others"],
    categories: [],
  });
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    const savedPreferences = cookieUtils.get("userPreferences");
    if (savedPreferences) {
      setPreferences(savedPreferences);
    } else {
      cookieUtils.set("userPreferences", preferences);
      const savedPreferences = cookieUtils.get("userPreferences");
      setPreferences(savedPreferences);
    }
  }, []);

  const savePreferences = () => {
    try {
      cookieUtils.set("userPreferences", preferences);
      toast("Preferences saved", {
        description: "Your content preferences have been successfully saved.",
      });
    } catch {
      toast("Error saving preferences", {
        description:
          "There was an error saving your preferences. Please try again.",
      });
    }
  };

  const resetPreferences = () => {
    const defaultPrefs: UserPreferences = {
      sources: [],
      categories: [],
    };
    setPreferences(defaultPrefs);
    cookieUtils.delete("userPreferences");
    toast("Preferences reset", {
      description: "Your preferences have been reset to default settings.",
    });
  };

  const handleNewsSourceToggle = (sourceId: string) => {
    setPreferences((prev) => ({
      ...prev,
      sources: prev.sources.includes(sourceId)
        ? prev.sources.filter((id) => id !== sourceId)
        : [...prev.sources, sourceId],
    }));
  };

  const handlePredefinedCategoryToggle = (categoryId: string) => {
    setPreferences((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const addCustomCategory = () => {
    if (
      newCategory.trim() && !preferences.categories.includes(newCategory.trim())
    ) {
      setPreferences((prev) => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()],
      }));
      setNewCategory("");
      toast("Category added", {
        description:
          `"${newCategory.trim()}" has been added to your custom categories.`,
      });
    }
  };

  const removeCustomCategory = (category: string) => {
    setPreferences((prev) => ({
      ...prev,
      categories: prev.categories.filter((cat) => cat !== category),
    }));
    toast("Category removed", {
      description:
        `"${category}" has been removed from your custom categories.`,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addCustomCategory();
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6" />
            <h1 className="text-3xl font-bold">Content Preferences</h1>
          </div>
          <p className="text-muted-foreground">
            Customize your content experience by selecting your preferred news
            sources and creating custom categories.
          </p>
        </div>

        {/* News Sources Section */}
        <Card>
          <CardHeader>
            <CardTitle>News Sources</CardTitle>
            <CardDescription>
              Select the news sources you'd like to see content from. You can
              choose multiple sources.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DEFAULT_NEWS_SOURCES.map((source) => (
                <div
                  key={source.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={source.id}
                    checked={preferences.sources.includes(source.id)}
                    onCheckedChange={() => handleNewsSourceToggle(source.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="inline-flex justify-between w-full">
                      <Label
                        htmlFor={source.id}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {source.name}
                      </Label>
                      <img
                        src={"https://placehold.co/64x64"}
                        alt=""
                        className="size-6 rounded-full"
                        onError={(e) =>
                          (e.target as HTMLImageElement).src =
                            "https://placehold.co/64x64"}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {source.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {preferences.sources.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">
                  Selected sources ({preferences.sources.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {preferences.sources.map((sourceId) => {
                    const source = DEFAULT_NEWS_SOURCES.find((s) =>
                      s.id === sourceId
                    );
                    return source
                      ? (
                        <Badge key={sourceId} variant="secondary">
                          {source.name}
                        </Badge>
                      )
                      : null;
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Categories Section */}
        <Card>
          <CardHeader>
            <CardTitle>Content Categories</CardTitle>
            <CardDescription>
              Select from predefined categories or create your own custom
              categories to personalize your content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Predefined Categories */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-semibold">
                    Predefined Categories
                  </Label>
                  <Badge variant="outline" className="text-xs">
                    Popular
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {PREDEFINED_CATEGORIES.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={`predefined-${category.id}`}
                        checked={preferences.categories.includes(category.name)}
                        onCheckedChange={() =>
                          handlePredefinedCategoryToggle(category.name)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <Label
                          htmlFor={`predefined-${category.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {category.name}
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selected predefined categories summary */}
                {preferences.categories.filter((cat) =>
                      isPredefinedCategory(cat)
                    ).length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">
                      Selected predefined categories (
                      {preferences.categories.filter((cat) =>
                        isPredefinedCategory(cat)
                      ).length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {preferences.categories
                        .filter((cat) => isPredefinedCategory(cat))
                        .map((categoryId) => {
                          const category = getPredefinedCategory(categoryId);
                          return category
                            ? (
                              <Badge key={categoryId} variant="secondary">
                                {category.name}
                              </Badge>
                            )
                            : null;
                        })}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Custom Categories */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-semibold">
                    Custom Categories
                  </Label>
                  <Badge variant="outline" className="text-xs">
                    Your Own
                  </Badge>
                </div>

                {/* Add new category */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter a new category name..."
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button
                    onClick={addCustomCategory}
                    disabled={!newCategory.trim() ||
                      preferences.categories.includes(newCategory.trim())}
                    size="icon"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Display custom categories */}
                {preferences.categories.filter((cat) =>
                    !isPredefinedCategory(cat)
                  ).length > 0
                  ? (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Your Custom Categories:
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {preferences.categories
                          .filter((cat) => !isPredefinedCategory(cat))
                          .map((category) => (
                            <div
                              key={category}
                              className="flex items-center justify-between p-2 rounded-lg border bg-muted/20"
                            >
                              <span className="text-sm font-medium">
                                {category}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCustomCategory(category)}
                                className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )
                  : (
                    <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                      <p className="text-sm">No custom categories yet.</p>
                      <p className="text-xs mt-1">
                        Add your first custom category above to get started.
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Section */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences Summary</CardTitle>
            <CardDescription>
              Overview of your current content preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">News Sources:</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {preferences.sources.length > 0
                    ? `${preferences.sources.length} source${
                      preferences.sources.length !== 1 ? "s" : ""
                    } selected`
                    : "No news sources selected"}
                </p>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium">
                  Predefined Categories:
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {preferences.categories.filter((cat) =>
                      isPredefinedCategory(cat)
                    ).length > 0
                    ? `${
                      preferences.categories.filter((cat) =>
                        isPredefinedCategory(cat)
                      ).length
                    } predefined categor${
                      preferences.categories.filter((cat) =>
                          isPredefinedCategory(cat)
                        ).length !== 1
                        ? "ies"
                        : "y"
                    } selected`
                    : "No predefined categories selected"}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Custom Categories:
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {preferences.categories.filter((cat) =>
                      !isPredefinedCategory(cat)
                    ).length > 0
                    ? `${
                      preferences.categories.filter((cat) =>
                        !isPredefinedCategory(cat)
                      ).length
                    } custom categor${
                      preferences.categories.filter((cat) =>
                          !isPredefinedCategory(cat)
                        ).length !== 1
                        ? "ies"
                        : "y"
                    } created`
                    : "No custom categories created"}
                </p>
              </div>

              {/* Total categories */}
              <div className="pt-2 border-t">
                <Label className="text-sm font-medium">Total Categories:</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {preferences.categories.length > 0
                    ? `${preferences.categories.length} total categor${
                      preferences.categories.length !== 1 ? "ies" : "y"
                    } selected`
                    : "No categories selected"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button onClick={savePreferences} className="flex-1 sm:flex-none">
            <Save className="h-4 w-4 mr-2" />
            Save Preferences
          </Button>
          <Button
            variant="outline"
            onClick={resetPreferences}
            className="flex-1 sm:flex-none"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
        </div>
      </div>
    </div>
  );
}
