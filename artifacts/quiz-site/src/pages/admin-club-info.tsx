import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  LogOut,
  Plus,
  Trash2,
  Upload,
  Save,
  ImageOff,
  History,
} from "lucide-react";
import {
  useGetClubInfo,
  useGetClubInfoHistory,
  useUpdateClubInfo,
  type ClubInfoContent,
  type ClubInfoGalleryItem,
  type ClubInfoSocial,
} from "@workspace/api-client-react";
import { useAdminAuth } from "@/lib/admin-auth";
import { DEFAULT_CLUB_INFO } from "@/lib/club-info-content";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const inputCls =
  "bg-white/5 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-primary";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="glass-panel border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle className="text-xl font-display text-white">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function ImageField({
  url,
  onChange,
  label,
}: {
  url: string | null;
  onChange: (url: string | null) => void;
  label: string;
}) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadToCloudinary(file);
      onChange(uploaded);
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Could not upload",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {url ? (
          <img
            src={url}
            alt={label}
            className="h-20 w-28 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-20 w-28 items-center justify-center rounded-lg border border-dashed border-white/20 text-white/30">
            <ImageOff className="h-5 w-5" />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <label>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
              disabled={uploading}
            />
            <span className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {url ? "Replace" : "Upload"}
            </span>
          </label>
          {url && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-left text-xs text-red-300 hover:text-red-200"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function formatEditedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function HistoryPanel({ refreshKey }: { refreshKey: number }) {
  const { data, isLoading, isError, refetch } = useGetClubInfoHistory({
    limit: 20,
  });

  useEffect(() => {
    if (refreshKey > 0) refetch();
  }, [refreshKey, refetch]);

  const entries = data?.entries ?? [];

  return (
    <Section title="Edit history">
      <p className="text-sm text-white/50" data-testid="text-history-intro">
        The most recent saves of this page, newest first.
      </p>
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-white/50">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading history…
        </div>
      ) : isError ? (
        <p className="text-sm text-red-300">Could not load edit history.</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-white/40" data-testid="text-history-empty">
          No edits recorded yet.
        </p>
      ) : (
        <ul className="space-y-2" data-testid="list-history">
          {entries.map((entry, i) => (
            <li
              key={entry.id}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
              data-testid={`history-entry-${i}`}
            >
              <History className="h-4 w-4 shrink-0 text-white/40" />
              <div className="min-w-0 text-sm">
                <span className="text-white">
                  {entry.editedByName ?? "Unknown"}
                </span>
                <span className="text-white/50">
                  {" "}
                  · {formatEditedAt(entry.editedAt)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function Editor({
  initial,
  updatedAt,
  updatedByName,
}: {
  initial: ClubInfoContent;
  updatedAt: string | null;
  updatedByName: string | null;
}) {
  const { toast } = useToast();
  const { signOut } = useAdminAuth();
  const update = useUpdateClubInfo();
  const [content, setContent] = useState<ClubInfoContent>(initial);
  const [lastEdit, setLastEdit] = useState<{
    at: string | null;
    by: string | null;
  }>({ at: updatedAt, by: updatedByName });
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  function patch(updater: (c: ClubInfoContent) => ClubInfoContent) {
    setContent((c) => updater(structuredClone(c)));
  }

  async function handleSave() {
    try {
      const res = await update.mutateAsync({ data: content });
      setLastEdit({
        at: res.updatedAt ?? null,
        by: res.updatedByName ?? null,
      });
      setHistoryRefreshKey((k) => k + 1);
      toast({ title: "Saved", description: "The info page has been updated." });
    } catch (err) {
      toast({
        title: "Save failed",
        description:
          (err as { data?: { error?: string } })?.data?.error ||
          (err instanceof Error ? err.message : "Could not save"),
        variant: "destructive",
      });
    }
  }

  return (
    <div className="w-full max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            Edit info page
          </h1>
          <p className="text-sm text-white/50">
            Changes go live immediately — no redeploy needed.
          </p>
          {lastEdit.at && (
            <p className="mt-1 text-xs text-white/40" data-testid="text-last-edited">
              Last edited
              {lastEdit.by ? ` by ${lastEdit.by}` : ""} on{" "}
              {formatEditedAt(lastEdit.at)}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => signOut()}
          className="border-white/20 bg-white/5 text-white hover:bg-white/10"
          data-testid="button-signout"
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </div>

      <HistoryPanel refreshKey={historyRefreshKey} />

      {/* Hero */}
      <Section title="Hero">
        <div className="space-y-2">
          <Label className="text-white/70">Hero photo</Label>
          <ImageField
            url={content.hero.imageUrl}
            label="Hero"
            onChange={(url) =>
              patch((c) => {
                c.hero.imageUrl = url;
                return c;
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white/70">Badge</Label>
          <Input
            className={inputCls}
            value={content.hero.badge}
            onChange={(e) =>
              patch((c) => {
                c.hero.badge = e.target.value;
                return c;
              })
            }
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-white/70">Title (lead)</Label>
            <Input
              className={inputCls}
              value={content.hero.titleLead}
              onChange={(e) =>
                patch((c) => {
                  c.hero.titleLead = e.target.value;
                  return c;
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label className="text-white/70">Title (highlight)</Label>
            <Input
              className={inputCls}
              value={content.hero.titleHighlight}
              onChange={(e) =>
                patch((c) => {
                  c.hero.titleHighlight = e.target.value;
                  return c;
                })
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-white/70">Description</Label>
          <Textarea
            className={inputCls}
            rows={3}
            value={content.hero.description}
            onChange={(e) =>
              patch((c) => {
                c.hero.description = e.target.value;
                return c;
              })
            }
          />
        </div>
      </Section>

      {/* About */}
      <Section title="About">
        <div className="space-y-2">
          <Label className="text-white/70">Heading</Label>
          <Input
            className={inputCls}
            value={content.about.heading}
            onChange={(e) =>
              patch((c) => {
                c.about.heading = e.target.value;
                return c;
              })
            }
          />
        </div>
        {content.about.paragraphs.map((para, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-white/70">Paragraph {i + 1}</Label>
              <button
                type="button"
                onClick={() =>
                  patch((c) => {
                    c.about.paragraphs.splice(i, 1);
                    return c;
                  })
                }
                className="text-xs text-red-300 hover:text-red-200"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <Textarea
              className={inputCls}
              rows={3}
              value={para}
              onChange={(e) =>
                patch((c) => {
                  c.about.paragraphs[i] = e.target.value;
                  return c;
                })
              }
            />
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="border-white/20 bg-white/5 text-white hover:bg-white/10"
          onClick={() =>
            patch((c) => {
              c.about.paragraphs.push("");
              return c;
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Add paragraph
        </Button>
      </Section>

      {/* Domains */}
      <Section title="Domains">
        {content.domains.map((d, i) => (
          <div
            key={d.key || i}
            className="space-y-2 rounded-lg border border-white/10 p-3"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs text-white/50">Label</Label>
                <Input
                  className={inputCls}
                  value={d.label}
                  onChange={(e) =>
                    patch((c) => {
                      c.domains[i].label = e.target.value;
                      return c;
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-white/50">
                  Key (icon) — {d.key}
                </Label>
                <Input
                  className={inputCls}
                  value={d.key}
                  onChange={(e) =>
                    patch((c) => {
                      c.domains[i].key = e.target.value;
                      return c;
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-white/50">Blurb</Label>
              <Textarea
                className={inputCls}
                rows={2}
                value={d.blurb}
                onChange={(e) =>
                  patch((c) => {
                    c.domains[i].blurb = e.target.value;
                    return c;
                  })
                }
              />
            </div>
            <button
              type="button"
              onClick={() =>
                patch((c) => {
                  c.domains.splice(i, 1);
                  return c;
                })
              }
              className="text-xs text-red-300 hover:text-red-200"
            >
              Remove domain
            </button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="border-white/20 bg-white/5 text-white hover:bg-white/10"
          onClick={() =>
            patch((c) => {
              c.domains.push({ key: "", label: "", blurb: "" });
              return c;
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Add domain
        </Button>
      </Section>

      {/* Gallery */}
      <Section title="Gallery">
        <div className="grid gap-4 sm:grid-cols-2">
          {content.gallery.map((item: ClubInfoGalleryItem, i) => (
            <div
              key={i}
              className="space-y-2 rounded-lg border border-white/10 p-3"
            >
              <ImageField
                url={item.url || null}
                label={`Gallery ${i + 1}`}
                onChange={(url) =>
                  patch((c) => {
                    c.gallery[i].url = url ?? "";
                    return c;
                  })
                }
              />
              <Input
                className={inputCls}
                placeholder="Caption"
                value={item.caption}
                onChange={(e) =>
                  patch((c) => {
                    c.gallery[i].caption = e.target.value;
                    return c;
                  })
                }
              />
              <button
                type="button"
                onClick={() =>
                  patch((c) => {
                    c.gallery.splice(i, 1);
                    return c;
                  })
                }
                className="text-xs text-red-300 hover:text-red-200"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-white/20 bg-white/5 text-white hover:bg-white/10"
          onClick={() =>
            patch((c) => {
              c.gallery.push({ url: "", caption: "" });
              return c;
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Add photo
        </Button>
      </Section>

      {/* Socials */}
      <Section title="Contact & socials">
        {content.socials.map((s: ClubInfoSocial, i) => (
          <div
            key={i}
            className="grid gap-3 rounded-lg border border-white/10 p-3 sm:grid-cols-3"
          >
            <div className="space-y-1">
              <Label className="text-xs text-white/50">Label (icon)</Label>
              <Input
                className={inputCls}
                value={s.label}
                onChange={(e) =>
                  patch((c) => {
                    c.socials[i].label = e.target.value;
                    return c;
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-white/50">Display text</Label>
              <Input
                className={inputCls}
                value={s.value}
                onChange={(e) =>
                  patch((c) => {
                    c.socials[i].value = e.target.value;
                    return c;
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-white/50">Link (href)</Label>
              <div className="flex gap-2">
                <Input
                  className={inputCls}
                  value={s.href}
                  onChange={(e) =>
                    patch((c) => {
                      c.socials[i].href = e.target.value;
                      return c;
                    })
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    patch((c) => {
                      c.socials.splice(i, 1);
                      return c;
                    })
                  }
                  className="text-red-300 hover:text-red-200"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="border-white/20 bg-white/5 text-white hover:bg-white/10"
          onClick={() =>
            patch((c) => {
              c.socials.push({ label: "", value: "", href: "" });
              return c;
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Add link
        </Button>
      </Section>

      <div className="sticky bottom-4 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={update.isPending}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:from-blue-400 hover:to-purple-500"
          data-testid="button-save"
        >
          {update.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save changes
        </Button>
      </div>
    </div>
  );
}

function LoginForm() {
  const { signIn } = useAdminAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await signIn(email, password);
    } catch (err) {
      toast({
        title: "Sign in failed",
        description: err instanceof Error ? err.message : "Check your details",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <Card className="glass-panel border-white/10 bg-white/5 shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-display">Core team login</CardTitle>
          <CardDescription className="text-white/60">
            Sign in to edit the public info page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white/70">Email</Label>
              <Input
                type="email"
                className={inputCls}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-admin-email"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Password</Label>
              <Input
                type="password"
                className={inputCls}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="input-admin-password"
              />
            </div>
            <Button
              type="submit"
              disabled={busy}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-400 hover:to-purple-500"
              data-testid="button-admin-login"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function EditorLoader() {
  const { data, isLoading } = useGetClubInfo();
  if (isLoading) {
    return <Loader2 className="h-8 w-8 animate-spin text-white/60" />;
  }
  return (
    <Editor
      initial={data?.content ?? DEFAULT_CLUB_INFO}
      updatedAt={data?.updatedAt ?? null}
      updatedByName={data?.updatedByName ?? null}
    />
  );
}

export default function AdminClubInfo() {
  const { loading, configured, session } = useAdminAuth();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!loading) setHydrated(true);
  }, [loading]);

  if (loading || !hydrated) {
    return <Loader2 className="h-8 w-8 animate-spin text-white/60" />;
  }

  if (!configured) {
    return (
      <Card className="glass-panel max-w-md border-white/10 bg-white/5">
        <CardContent className="p-6 text-center text-white/70">
          Admin login isn't configured on the server yet.
        </CardContent>
      </Card>
    );
  }

  if (!session) return <LoginForm />;
  return <EditorLoader />;
}
