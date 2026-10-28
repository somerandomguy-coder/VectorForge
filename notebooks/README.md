# ⚡ VectorForge Experimentation Lab (Google Colab)

This directory contains the standalone Jupyter Notebook designed for isolated experiments with generative diffusion models, prompt engineering, background knockout, and raster-to-SVG vectorization before integrating into **VectorForge**.

## 🚀 Quick Start in Google Colab

### Method 1: Direct File Upload
1. Open [Google Colab](https://colab.research.google.com/).
2. Select **Upload** tab.
3. Choose [`VectorForge_Sprite_Diffusion_Playground.ipynb`](./VectorForge_Sprite_Diffusion_Playground.ipynb).
4. In Colab, make sure GPU is active: **Runtime** → **Change runtime type** → Select **T4 GPU** or higher.
5. Run the cells step-by-step or click **Runtime** → **Run all**.

### Method 2: Open from GitHub
1. In [Google Colab](https://colab.research.google.com/), select the **GitHub** tab.
2. Enter your repository URL: `somerandomguy-coder/VectorForge`.
3. Select `VectorForge_Sprite_Diffusion_Playground.ipynb`.

---

## 🔬 What You Can Experiment With in This Notebook

1. **Diffusion Models (`diffusers`):**
   - `stabilityai/sd-turbo` (distilled 1-step, sub-second latency, ideal for VectorForge)
   - `stabilityai/sdxl-turbo` (high-fidelity 1-4 step SDXL)
   - `runwayml/stable-diffusion-v1-5` (compatible with pixel-art LoRAs and community fine-tunes)
   - Any custom Hugging Face model ID.

2. **Prompt Engineering & Style Templates:**
   - Minimal Vector Logos
   - Modern App Icons & Glyphs
   - 16-Bit RPG Sprites & Items
   - Isometric Game Assets / Props
   - Pixel Character Sprite Sheets
   - Geometric Badges & Crests
   - Chibi Game Stickers

3. **Alpha Knockout & Background Removal:**
   - **Luminance Thresholding:** Direct Python reproduction of VectorForge's client-side canvas logic (`alpha-knockout.ts`).
   - **Corner Chroma-Keying:** Automatically samples corner pixels to mask out white, black, or custom colored backdrops.
   - **AI Deep Learning (`rembg` / U2-Net):** High-precision segmentation for complex or soft-edged sprites.

4. **Vectorization & Scalable SVG (`vtracer` & Potrace):**
   - Tracing raster masks into SVG paths.
   - Monochrome vs Full-Color vectorization.
   - Instant SVG recoloring without model re-runs.

5. **Sprite Game Utilities:**
   - Color palette quantization (16 / 32 colors) and nearest-neighbor scaling for authentic pixel art.
   - Sprite sheet slicing (2x2 / 4x4 grids) into individual game frames.

6. **Interactive UI (`ipywidgets`):**
   - Keyword text box, style dropdown, seed randomizer, steps/guidance sliders.
   - 3-stage visual inspection: `[Raw Diffusion]` → `[Alpha Masked]` → `[Scalable SVG / Pixel Art]`.
   - One-click downloads for transparent `.png` and vector `.svg`.

---

## 🔄 Bridging Experiments to VectorForge

Once you find prompts and models that work well:
1. **Style Presets:** Copy your tested prompt prefixes and suffixes into [`src/ui/style-presets.ts`](../src/ui/style-presets.ts).
2. **ONNX Export for WebGPU:** Export the model weights via `optimum-cli export onnx` to run client-side in VectorForge's WebGPU pipeline.
