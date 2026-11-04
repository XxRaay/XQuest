# README Writing Rules for AI Coding Agents

Rules for creating or rewriting `README.md` in any project.
Works as `AGENTS.md` (Codex, Antigravity, Cursor, Copilot), `CLAUDE.md` (Claude Code), or `.agent/rules/readme.md`.

> Derived from an analysis of 44 READMEs of top GitHub projects (React, Vue, Vite, FastAPI, Ollama, Supabase, ripgrep, fzf, bat, lazygit, Excalidraw, n8n, Tauri, Requests, Rich and others).

---

## 0. What the data says

| Element | Share of top READMEs |
|---|---|
| Links to external docs / website | 98% |
| Logo or image at the top | 95% |
| Badges (version, CI, license) | 86% |
| Code blocks | 75% |
| Contributing section or link | 73% |
| Install section | 64% |
| Shell install snippet (`npm i`, `pip install`, `brew`, `curl`) | 61% |
| Usage / Quick start | 61% |
| Centered hero block (`<p align="center">`) | 57% |
| License section | 48% |
| Sponsors / support | 45% |
| Features / Why | 43% |
| Community / Support | 41% |
| One-line tagline in a blockquote | 34% |
| Table of contents | 16% |
| GIF / video / screenshot demo | 23% (the CLI and UI tools with highest stars use it) |
| FAQ / Roadmap | under 5% |

Median length is about 130 lines. Short READMEs (React, Tailwind, shadcn/ui, Vite) work only because a full docs site exists. Without a docs site, the README must carry the docs.

**Conclusion:** a strong README is a landing page. It answers "what is it, why do I care, how do I run it in 60 seconds, where do I go next".

---

## 1. Before writing anything

1. **Read the project first.** Inspect `package.json` / `pyproject.toml` / `Cargo.toml` / `go.mod` / `Makefile` / `Dockerfile` / `.github/workflows` / `src` / `examples` / `tests` / existing docs.
2. **Determine the project type** (see section 4) and the audience (end user, library consumer, contributor, operator).
3. **Never invent.** Every command, flag, option, URL, badge, feature and version in the README must be verified in the repo. If you cannot verify it, leave it out or mark `TODO` and tell the user.
4. **Run the quick-start commands** if the environment allows. A README whose first command fails is worse than no README.
5. If a README already exists, **improve it, do not erase it.** Keep accurate project-specific content, links, and the author's voice. Show what changed.
6. Write in the language the user is using in the conversation. If the project is public and international, default to English and offer a translation as a separate file (`README.ru.md`, etc.) linked at the top.

---

## 2. Universal structure (in this order)

Include only sections that have real content. Delete empty ones.

### 2.1 Hero block (first screen, no scrolling)
1. **Logo or banner** (optional; skip if none exists, never generate a fake one). Use `<picture>` with dark/light variants when both exist.
2. **`# Project Name`**, exactly one H1.
3. **Tagline: one sentence, up to 20 words:** what it is, for whom, the key differentiator. No marketing fluff ("blazing fast", "revolutionary") unless backed by a benchmark.
4. **Badges, max 4 to 6, one row:** version/release, build/CI, license, and optionally downloads or coverage. Only badges that point to real, working services for this repo.
5. **Quick links row:** `Docs · Demo · Install · Examples · Contributing`, as anchors or URLs.
6. **Demo:** screenshot, GIF, terminal recording, or a 5 to 10 line code sample showing the result. Visual or runnable proof beats descriptions. Keep media under about 5 MB and always add `alt` text.

### 2.2 Why / What it does
- 3 to 7 bullets of **concrete benefits or features**, each starting with a verb or a noun, each verifiable.
- Optional **"Why X?" / "Why not X?"** (ripgrep, Transformers do this well): honest trade-offs build trust.
- Optional comparison table versus alternatives, only if fair and accurate.

### 2.3 Install
- Copy-pasteable blocks with language tags (`bash`, `powershell`).
- **Most common path first** (package manager), then alternatives (Docker, binary, from source).
- State prerequisites with versions (`Node >= 20`, `Python >= 3.10`).
- One command per line, no `$` prompt prefix so it stays copyable.

### 2.4 Quick start / Usage
- **Goal: from zero to a visible result in under 60 seconds.**
- The smallest working example first, then 2 to 4 realistic examples of increasing complexity.
- Show **expected output** next to the command or code.
- Link to full docs instead of duplicating them.

### 2.5 Documentation & resources
- Link to docs site, API reference, examples folder, changelog, discussions.
- If there is no docs site, add `## Configuration` / `## API` / `## CLI reference` sections here, as tables.

### 2.6 Contributing
- 3 to 6 lines: how to set up the dev environment, run tests, open a PR. Link `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md` if they exist.
- Provide the actual dev commands (`git clone`, install, `test`, `lint`).

### 2.7 Community / Support (if applicable)
Issues, Discussions, Discord/Slack, security reporting (`SECURITY.md`).

### 2.8 Sponsors / Credits (if applicable)
Keep it at the bottom. Never put sponsors above the product description (FastAPI and Vue do this and it buries the point).

### 2.9 License
One line: `MIT © Author` plus a link to `LICENSE`. Make sure a `LICENSE` file exists; if not, ask the user which one to use. Do not guess.

---

## 3. Writing and formatting rules

**Content**
- Lead with the **user's problem and outcome**, not the implementation or history.
- Short sentences, active voice, present tense, second person ("you").
- No walls of text: paragraphs max 3 to 4 lines.
- Define jargon and acronyms on first use.
- Be specific: numbers, versions, supported platforms, real benchmarks with a link to the methodology.
- Do not claim what you cannot support (stars, "production-ready", "secure", performance).
- No filler sections: no "Introduction" that repeats the tagline, no "Table of contents" for short files.

**Markdown**
- One H1, then H2 for sections, H3 for subsections. Do not skip levels.
- Add a **table of contents only if the file exceeds about 200 lines.**
- Every code block has a language tag.
- Tables for options, flags, env vars, platform support. Lists for features and steps.
- Use relative links for in-repo files, absolute URLs for images that must render on package registries (npm, PyPI, crates.io).
- Use `<details>` to fold long optional content (platform-specific install, long output).
- Emoji: at most one per heading or none, consistently. Never emoji-spam.
- Alerts (`> [!NOTE]`, `> [!WARNING]`) sparingly, for real warnings only.
- Keep line lengths sane and avoid trailing whitespace; no broken links, test them.

**Visual quality**
- Centered hero via `<p align="center">` is fine, but the rest of the document is left-aligned.
- Consistent image widths; no oversized screenshots; support dark mode when possible.
- Do not add decorative badges (visitor counters, "made with love", star-history spam).

---

## 4. Templates by project type

Pick one, then adapt.

**CLI tool** (ripgrep, fzf, bat, lazygit, jq): hero + demo GIF/terminal output, features with examples, install per OS, usage with real output, configuration, comparison with alternatives.

**Library / SDK / framework** (Requests, Axios, Express, Rich, Gin): hero, install, minimal code example, features, link to API docs, supported versions/platforms, contributing.

**Web app / self-hosted product** (Excalidraw, Immich, n8n, Supabase): hero + screenshot/demo link, key features, quick start (Docker Compose first), configuration/env table, architecture or "how it works" (optional), links, contributing.

**ML / AI project** (Transformers, llama.cpp, Ollama): hero, quick start with a 5-line example, supported models/backends table, hardware requirements, benchmarks, citation block (`BibTeX`), license of weights vs code.

**Monorepo**: hero, table of packages (name, description, version, link), shared dev setup, contributing. Each package gets its own short README.

**Template / starter**: what you get, `Use this template` instructions, project structure tree, how to customize, deploy buttons.

**Awesome list / dataset / docs repo**: one-line scope, curated table or list with a consistent entry format, inclusion criteria, how to contribute an entry.

---

## 5. Anti-patterns (never do)

- Copy-pasting generic boilerplate with `[Project Name]`, `your-username` placeholders left in.
- A README that is only the project name and a description.
- Commands that do not exist in the repo, or install steps you did not verify.
- Giant badge walls, or badges for services the repo does not use.
- Long history, philosophy, or roadmap before showing how to install and run.
- Duplicating the full docs inside the README when a docs site exists.
- Screenshots of text that should be a code block.
- Hardcoded secrets, tokens, internal URLs or personal paths in examples.
- Claiming a license, test coverage or platform support without checking.
- Rewriting the whole README when the user asked for a small change.

---

## 6. Final checklist (run before finishing)

- [ ] The first screen tells what the project is, for whom, and why, in about 5 seconds.
- [ ] One H1, logical heading hierarchy.
- [ ] Install and quick-start commands verified against the repo (or run).
- [ ] The first example produces a visible result; output shown.
- [ ] All links, anchors, image paths work.
- [ ] Badges are real and at most 6.
- [ ] No placeholders, TODOs or invented facts remain (except explicitly flagged to the user).
- [ ] License and contributing are present and accurate.
- [ ] Readable in both light and dark GitHub themes.
- [ ] Length fits the project: small lib about 60 to 150 lines; big product about 150 to 300; anything longer moves to `docs/`.

After finishing, give the user a **short summary**: what you wrote, what you verified, and what needs their input (logo, demo GIF, license choice, missing links).
