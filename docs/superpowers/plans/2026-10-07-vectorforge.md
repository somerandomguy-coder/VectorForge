# VectorForge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build VectorForge, a zero-cloud client-side in-browser vector logo and icon studio featuring WebGPU-accelerated diffusion inference, OPFS weight streaming & caching, canvas alpha knockout, Potrace vector tracing, brand typography layout, and multi-format vector/favicon exports.

**Architecture:** Client-side static application running on Vite + TypeScript. Heavy inference and storage streaming run in a dedicated Web Worker via a typed RPC protocol. Post-processing combines OffscreenCanvas luminance thresholding with Potrace vector tracing to generate clean, scalable SVG paths with real-time recoloring, brand typography composition, and instant export to SVG, PNG, and multi-resolution ICO.

**Tech Stack:** Vite, TypeScript, Vanilla CSS (Modern Studio Design System), ONNX Runtime Web (`onnxruntime-web` WebGPU EP), `@cadit-app/potrace-ts` (Worker & browser-compatible Potrace engine), Origin Private File System (OPFS) / Cache API.

## Global Constraints
- Zero backend dependencies: 100% client-side static application deployable to GitHub Pages / Cloudflare Pages.
- WebGPU memory cap: keep sequential model execution under 1.5 GB VRAM.
- Windows TDR Watchdog prevention: yield between inference steps via micro-task / event loop tick.
- High-contrast, clean vector iconography: enforce symbol/mark prompt templates and keep brand text decoupled in a dedicated typography vector layout layer.
- Git checkpointing: stage, commit, and push after each major milestone.

---

### Task 1: Project Scaffolding & High-End Studio Design System

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/styles/index.css`
- Create: `src/main.ts`

- [ ] **Step 1: Create project configuration files (`package.json`, `tsconfig.json`, `vite.config.ts`)**
- [ ] **Step 2: Install core dependencies (`onnxruntime-web`, `@cadit-app/potrace-ts`, `canvas-confetti`, `@types/canvas-confetti`)**
- [ ] **Step 3: Build the index.html semantic layout and modern studio CSS design system**
- [ ] **Step 4: Verify Vite builds and dev runs cleanly**
- [ ] **Step 5: Git commit and push checkpoint 1**

---

### Task 2: Hardware Pre-Flight & Web Worker RPC Architecture

**Files:**
- Create: `src/workers/rpc-protocol.ts`
- Create: `src/workers/hardware-check.ts`
- Create: `src/workers/engine.worker.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Define typed RPC message types and payloads in `rpc-protocol.ts`**
- [ ] **Step 2: Implement hardware diagnostic checker querying `navigator.gpu`, `shader-f16`, `maxStorageBufferBindingSize`, and storage quota**
- [ ] **Step 3: Setup Web Worker message dispatcher with error handling and transferable object support**
- [ ] **Step 4: Integrate live hardware diagnostic pill and status modal in the UI**
- [ ] **Step 5: Git commit and push checkpoint 2**

---

### Task 3: Weight Storage Manager (OPFS Streaming & Cache API Fallback)

**Files:**
- Create: `src/workers/storage-manager.ts`
- Modify: `src/workers/engine.worker.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Implement OPFS directory handle access and chunked stream downloader with `fetch()` and `ReadableStream`**
- [ ] **Step 2: Implement byte-level progress reporting and download speed calculation**
- [ ] **Step 3: Add Cache API fallback for environments where OPFS is constrained**
- [ ] **Step 4: Implement cache inspection, size reporting, and one-click cache deletion**
- [ ] **Step 5: Git commit and push checkpoint 3**

---

### Task 4: AI Inference Pipeline & Dual Generation Engine

**Files:**
- Create: `src/workers/onnx-pipeline.ts`
- Create: `src/workers/procedural-engine.ts`
- Modify: `src/workers/engine.worker.ts`
- Modify: `src/ui/style-presets.ts`

- [ ] **Step 1: Implement ONNX Runtime Web WebGPU session management with sequential memory allocation**
- [ ] **Step 2: Implement TDR watchdog prevention yields and `onSubmittedWorkDone()` synchronization**
- [ ] **Step 3: Implement instant procedural logo & demo latent synthesis engine for zero-wait immediate testing**
- [ ] **Step 4: Wire generation pipeline to emit progress frames and final `ImageBitmap` to main thread**
- [ ] **Step 5: Git commit and push checkpoint 4**

---

### Task 5: Post-Processing: Background Knockout & Potrace Vector Tracing

**Files:**
- Create: `src/postprocess/alpha-knockout.ts`
- Create: `src/postprocess/vectorizer.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Implement canvas-based luminance knockout with thresholding, inversion, and smoothing**
- [ ] **Step 2: Integrate Potrace vectorizer converting thresholded bitmaps into clean SVG path data**
- [ ] **Step 3: Implement real-time SVG recoloring, path fill overrides, and stroke customization**
- [ ] **Step 4: Connect threshold and turdsize controls to live vector re-tracing**
- [ ] **Step 5: Git commit and push checkpoint 5**

---

### Task 6: Canvas Studio View, Brand Typography & Preset Controls

**Files:**
- Create: `src/ui/canvas-view.ts`
- Create: `src/ui/typography-layer.ts`
- Create: `src/ui/style-presets.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Implement multi-mode canvas/SVG preview stage (Raster, Alpha Mask, Vector Paths, Brand Mockup)**
- [ ] **Step 2: Add interactive zoom, pan, background grid switcher, and full-screen view**
- [ ] **Step 3: Implement brand typography overlay with custom brand name, tagline, font families, and layouts**
- [ ] **Step 4: Implement preset chips and keyword suggestions with positive/negative prompt composition**
- [ ] **Step 5: Git commit and push checkpoint 6**

---

### Task 7: Multi-Format Export Engine & Favicon Generator

**Files:**
- Create: `src/ui/export-manager.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Implement standalone SVG vector export with XML declaration and clean viewBox scaling**
- [ ] **Step 2: Implement high-resolution transparent PNG export (512x512 and 1024x1024)**
- [ ] **Step 3: Implement multi-size Favicon generator (16x16, 32x32, 48x48 PNG and `.ico` binary packer)**
- [ ] **Step 4: Add "Copy SVG Code" button with clipboard integration and celebratory toast notification**
- [ ] **Step 5: Git commit and push checkpoint 7**

---

### Task 8: Verification, Production Build & Final Push

- [ ] **Step 1: Run production build (`npm run build`) and verify no bundle errors**
- [ ] **Step 2: Verify static asset serving and worker script bundling**
- [ ] **Step 3: Final git commit and push to remote**
