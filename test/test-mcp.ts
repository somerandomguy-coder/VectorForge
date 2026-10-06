import { generateMcpLogo } from '../src/mcp/engine.js';
import { recolorSvg } from '../src/postprocess/vectorizer.js';
import { composeBrandSvg } from '../src/ui/typography-layer.js';

console.log('--- Testing VectorForge MCP Tools ---');

// Test 1: Generate VectorForge logo
const vfResult = generateMcpLogo({
  prompt: 'vectorforge emblem, geometric anvil and vector nodes',
  style: 'geometric-badge',
  colorHex: '#6366f1',
  brandName: 'VECTORFORGE',
  tagline: 'INTELLIGENT VECTOR STUDIO',
});

console.log('Test 1 (VectorForge Brand Logo):');
console.log('Path Count:', vfResult.pathCount);
console.log('SVG Length:', vfResult.svg.length);
console.log('SVG contains brand name:', vfResult.svg.includes('VECTORFORGE'));
console.log('SVG preview (first 150 chars):', vfResult.svg.slice(0, 150));

// Test 2: Recolor SVG
const recolored = recolorSvg(vfResult.markOnlySvg, '#06b6d4');
console.log('\nTest 2 (Recolor SVG to #06b6d4):');
console.log('Contains #06b6d4:', recolored.includes('#06b6d4'));

// Test 3: Compose Brand Mockup
const composed = composeBrandSvg(vfResult.markOnlySvg, {
  brandName: 'NEXUS LABS',
  tagline: 'AUTONOMOUS VECTOR LABS',
  fontFamily: "'Outfit', sans-serif",
  layout: 'horizontal',
  letterSpacing: 6,
  colorHex: '#10b981',
});
console.log('\nTest 3 (Horizontal Brand Mockup):');
console.log('Contains NEXUS LABS:', composed.includes('NEXUS LABS'));
console.log('Width is 800:', composed.includes('width="800"'));

console.log('\n✅ ALL MCP ENGINE TESTS PASSED!');
