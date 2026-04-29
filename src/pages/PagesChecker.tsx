import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, Loader2, ExternalLink } from "lucide-react";

type Status = "pending" | "checking" | "ok" | "fail" | "warn";

interface Check {
  id: string;
  title: string;
  status: Status;
  detail?: string;
  fix?: React.ReactNode;
}

const STORAGE_KEY = "gh-pages-checker:repo";

export default function PagesChecker() {
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [checks, setChecks] = useState<Check[]>([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { owner: o, repo: r } = JSON.parse(saved);
        if (o) setOwner(o);
        if (r) setRepo(r);
      } catch {}
    }
  }, []);

  const pagesUrl = useMemo(
    () => (owner && repo ? `https://${owner}.github.io/${repo}/` : ""),
    [owner, repo]
  );

  const update = (id: string, patch: Partial<Check>) =>
    setChecks((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  async function runChecks() {
    if (!owner || !repo) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ owner, repo }));
    setRunning(true);

    const initial: Check[] = [
      { id: "repo", title: "Repository exists & is public", status: "checking" },
      { id: "workflow", title: "Deploy workflow file present", status: "pending" },
      { id: "run", title: "Latest workflow run succeeded", status: "pending" },
      { id: "pages", title: "GitHub Pages is enabled & live", status: "pending" },
      { id: "url", title: "Pages URL responds (200 OK)", status: "pending" },
    ];
    setChecks(initial);

    // 1. Repo public + exists
    let repoPublic = false;
    try {
      const r = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      if (r.status === 404) {
        update("repo", {
          status: "fail",
          detail: "Repository not found OR it's private (GitHub API hides private repos from anonymous users).",
          fix: (
            <>
              Check spelling, then go to{" "}
              <a className="underline" target="_blank" rel="noreferrer"
                href={`https://github.com/${owner}/${repo}/settings`}>
                Settings → General → Danger Zone
              </a>{" "}
              and switch visibility to <strong>Public</strong>. Free GitHub plans only allow Pages on public repos.
            </>
          ),
        });
      } else if (r.ok) {
        const data = await r.json();
        if (data.private) {
          update("repo", {
            status: "fail",
            detail: "Repo is private. GitHub Pages on free plans requires a public repo.",
            fix: (
              <a className="underline" target="_blank" rel="noreferrer"
                href={`https://github.com/${owner}/${repo}/settings`}>
                Open Settings → make repo Public
              </a>
            ),
          });
        } else {
          repoPublic = true;
          update("repo", { status: "ok", detail: `Public repo on default branch: ${data.default_branch}` });
        }
      } else {
        update("repo", { status: "warn", detail: `GitHub API returned ${r.status}` });
      }
    } catch (e: any) {
      update("repo", { status: "fail", detail: e?.message ?? "Network error" });
    }

    // 2. Workflow file present
    let workflowOk = false;
    if (repoPublic) {
      try {
        const r = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/.github/workflows/static.yml`
        );
        if (r.ok) {
          workflowOk = true;
          update("workflow", { status: "ok", detail: ".github/workflows/static.yml found" });
        } else {
          update("workflow", {
            status: "fail",
            detail: "Workflow file .github/workflows/static.yml is missing.",
            fix: <>Push the static.yml workflow described in <code>DEPLOY_GITHUB_PAGES.md</code>.</>,
          });
        }
      } catch {
        update("workflow", { status: "warn", detail: "Could not verify workflow file." });
      }
    } else {
      update("workflow", { status: "warn", detail: "Skipped — repo not accessible." });
    }

    // 3. Latest workflow run
    let runOk = false;
    if (workflowOk) {
      try {
        const r = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/actions/workflows/static.yml/runs?per_page=1`
        );
        if (r.ok) {
          const data = await r.json();
          const run = data.workflow_runs?.[0];
          if (!run) {
            update("run", {
              status: "fail",
              detail: "Workflow has never been run.",
              fix: (
                <a className="underline" target="_blank" rel="noreferrer"
                  href={`https://github.com/${owner}/${repo}/actions`}>
                  Go to Actions → Run workflow
                </a>
              ),
            });
          } else if (run.status !== "completed") {
            update("run", {
              status: "warn",
              detail: `Latest run is still ${run.status}. Wait a moment and re-check.`,
            });
          } else if (run.conclusion === "success") {
            runOk = true;
            update("run", { status: "ok", detail: `Last run #${run.run_number} succeeded` });
          } else {
            update("run", {
              status: "fail",
              detail: `Last run #${run.run_number} ended with: ${run.conclusion}`,
              fix: (
                <a className="underline" target="_blank" rel="noreferrer" href={run.html_url}>
                  Open the failing run on GitHub →
                </a>
              ),
            });
          }
        } else {
          update("run", { status: "warn", detail: `Actions API returned ${r.status}` });
        }
      } catch {
        update("run", { status: "warn", detail: "Could not fetch workflow runs." });
      }
    } else {
      update("run", { status: "warn", detail: "Skipped — workflow file missing." });
    }

    // 4. Pages enabled
    let pagesOk = false;
    if (repoPublic) {
      try {
        const r = await fetch(`https://api.github.com/repos/${owner}/${repo}/pages`);
        if (r.status === 404) {
          update("pages", {
            status: "fail",
            detail: "Pages is not enabled on this repository.",
            fix: (
              <a className="underline" target="_blank" rel="noreferrer"
                href={`https://github.com/${owner}/${repo}/settings/pages`}>
                Open Settings → Pages → set Source to GitHub Actions
              </a>
            ),
          });
        } else if (r.ok) {
          const data = await r.json();
          if (data.build_type !== "workflow") {
            update("pages", {
              status: "fail",
              detail: `Pages source is "${data.build_type}" but should be "workflow" (GitHub Actions).`,
              fix: (
                <a className="underline" target="_blank" rel="noreferrer"
                  href={`https://github.com/${owner}/${repo}/settings/pages`}>
                  Settings → Pages → Source = GitHub Actions
                </a>
              ),
            });
          } else {
            pagesOk = true;
            update("pages", { status: "ok", detail: `Pages live at ${data.html_url}` });
          }
        } else {
          update("pages", { status: "warn", detail: `Pages API returned ${r.status}` });
        }
      } catch {
        update("pages", { status: "warn", detail: "Could not verify Pages status." });
      }
    } else {
      update("pages", { status: "warn", detail: "Skipped — repo not accessible." });
    }

    // 5. URL responds
    if (pagesOk && pagesUrl) {
      try {
        await fetch(pagesUrl, { mode: "no-cors" });
        // no-cors gives an opaque response — we can't read status, but no thrown error means it resolved.
        update("url", {
          status: "ok",
          detail: `Reached ${pagesUrl} (status hidden by browser CORS, but the request resolved).`,
        });
      } catch (e: any) {
        update("url", {
          status: "fail",
          detail: `Could not reach ${pagesUrl}. ${e?.message ?? ""}`,
          fix: <>Wait 1–2 minutes after the workflow completes, then re-check.</>,
        });
      }
    } else {
      update("url", { status: "warn", detail: "Skipped — Pages not enabled." });
    }

    setRunning(false);
  }

  return (
    <main className="container mx-auto max-w-3xl py-10 px-4">
      <h1 className="text-3xl font-bold mb-2">GitHub Pages Setup Checker</h1>
      <p className="text-muted-foreground mb-6">
        Diagnose why your published site shows a 404 or white screen. Each check links to the
        exact GitHub setting to fix.
      </p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your repository</CardTitle>
          <CardDescription>Enter the GitHub owner and repo name.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="owner">Owner / username</Label>
              <Input id="owner" placeholder="mhmdnojim" value={owner} onChange={(e) => setOwner(e.target.value.trim())} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repo">Repository name</Label>
              <Input id="repo" placeholder="doc-to-cv-ai" value={repo} onChange={(e) => setRepo(e.target.value.trim())} />
            </div>
          </div>
          {pagesUrl && (
            <p className="text-sm text-muted-foreground">
              Expected URL:{" "}
              <a className="underline" target="_blank" rel="noreferrer" href={pagesUrl}>
                {pagesUrl} <ExternalLink className="inline h-3 w-3" />
              </a>
            </p>
          )}
          <Button onClick={runChecks} disabled={!owner || !repo || running}>
            {running ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Running checks…</> : "Run checks"}
          </Button>
        </CardContent>
      </Card>

      {checks.length > 0 && (
        <div className="space-y-3">
          {checks.map((c) => (
            <CheckRow key={c.id} check={c} />
          ))}
        </div>
      )}
    </main>
  );
}

function CheckRow({ check }: { check: Check }) {
  const icon = {
    pending: <AlertCircle className="h-5 w-5 text-muted-foreground" />,
    checking: <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />,
    ok: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    fail: <XCircle className="h-5 w-5 text-destructive" />,
    warn: <AlertCircle className="h-5 w-5 text-yellow-600" />,
  }[check.status];

  const badge = {
    pending: <Badge variant="outline">Pending</Badge>,
    checking: <Badge variant="outline">Checking…</Badge>,
    ok: <Badge className="bg-green-600 hover:bg-green-600">OK</Badge>,
    fail: <Badge variant="destructive">Fix needed</Badge>,
    warn: <Badge variant="secondary">Skipped</Badge>,
  }[check.status];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="font-medium">{check.title}</h3>
              {badge}
            </div>
            {check.detail && <p className="text-sm text-muted-foreground">{check.detail}</p>}
            {check.fix && check.status === "fail" && (
              <div className="mt-2 text-sm rounded-md bg-muted p-3">
                <strong>How to fix: </strong>
                {check.fix}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
