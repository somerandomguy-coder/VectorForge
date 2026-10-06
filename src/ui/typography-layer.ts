/**
 * Brand Typography & Layout Composition Layer
 * Resolves typography constraint: Diffusion models cannot spell reliably,
 * so brand typography is rendered as an immaculate vector typography layer.
 */

export type BrandLayout = 'stacked' | 'horizontal' | 'mark-only';

export interface TypographyConfig {
  brandName: string;
  tagline: string;
  fontFamily: string;
  layout: BrandLayout;
  letterSpacing: number;
  colorHex: string;
}

/**
 * Combines an SVG vector mark with brand typography into a unified vector composition.
 */
export function composeBrandSvg(
  markSvgString: string,
  config: TypographyConfig
): string {
  if (config.layout === 'mark-only' || !config.brandName.trim()) {
    return markSvgString;
  }

  // Extract inner path elements from markSvgString
  const innerPathsMatch = markSvgString.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
  const innerContent = innerPathsMatch ? innerPathsMatch[1] : markSvgString;

  const brand = escapeXml(config.brandName.trim());
  const tagline = escapeXml(config.tagline.trim());
  const color = config.colorHex || '#ffffff';
  const spacing = config.letterSpacing ?? 4;
  const font = config.fontFamily || "'Space Grotesk', sans-serif";

  if (config.layout === 'stacked') {
    // Canvas: 512 x 580 (Mark on top, typography below)
    return `
<svg viewBox="0 0 512 580" width="512" height="580" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .brand-title {
        font-family: ${font};
        font-size: 32px;
        font-weight: 800;
        letter-spacing: ${spacing}px;
        fill: ${color};
        text-anchor: middle;
      }
      .brand-subtitle {
        font-family: ${font};
        font-size: 13px;
        font-weight: 600;
        letter-spacing: ${spacing + 2}px;
        fill: ${color};
        opacity: 0.75;
        text-anchor: middle;
      }
    </style>
  </defs>
  <!-- Vector Mark (Scaled & Centered in Top Half) -->
  <g transform="translate(68, 10) scale(0.74)">
    ${innerContent}
  </g>
  <!-- Brand Typography -->
  <text x="256" y="445" class="brand-title">${brand}</text>
  ${tagline ? `<text x="256" y="485" class="brand-subtitle">${tagline}</text>` : ''}
</svg>`.trim();
  } else {
    // Horizontal Layout: 800 x 360 (Mark on left, typography on right)
    return `
<svg viewBox="0 0 800 360" width="800" height="360" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .brand-title-h {
        font-family: ${font};
        font-size: 42px;
        font-weight: 800;
        letter-spacing: ${spacing}px;
        fill: ${color};
        text-anchor: start;
      }
      .brand-subtitle-h {
        font-family: ${font};
        font-size: 15px;
        font-weight: 600;
        letter-spacing: ${spacing + 2}px;
        fill: ${color};
        opacity: 0.75;
        text-anchor: start;
      }
    </style>
  </defs>
  <!-- Vector Mark (Left) -->
  <g transform="translate(30, 20) scale(0.62)">
    ${innerContent}
  </g>
  <!-- Brand Typography (Right) -->
  <text x="390" y="175" class="brand-title-h">${brand}</text>
  ${tagline ? `<text x="390" y="218" class="brand-subtitle-h">${tagline}</text>` : ''}
</svg>`.trim();
  }
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
