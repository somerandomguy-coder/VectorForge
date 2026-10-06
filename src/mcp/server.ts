import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import http from 'node:http';
import { generateMcpLogo } from './engine.js';
import { recolorSvg } from '../postprocess/vectorizer.js';
import { composeBrandSvg, type BrandLayout, type TypographyConfig } from '../ui/typography-layer.js';
import { STYLE_PRESETS, SAMPLE_CONCEPTS } from '../ui/style-presets.js';
import type { LogoStyle } from '../workers/rpc-protocol.js';

/**
 * VectorForge MCP Server
 * Conforms to the 2026 Stateless Model Context Protocol specification.
 * Supports both STDIO transport (for local CLI/IDE agents) and Stateless HTTP transport.
 */
export function createVectorForgeMcpServer(): McpServer {
  const server = new McpServer({
    name: 'vectorforge-mcp',
    version: '1.0.0',
  });

  // Tool 1: Forge Vector Logo
  server.tool(
    'forge_vector_logo',
    'Synthesizes an infinite-resolution vector logo or app icon using Potrace and geometric rasterization.',
    {
      prompt: z.string().describe('Concept or motif for the logo, e.g. "vectorforge emblem", "cybernetic falcon", "origami fox", "quantum atom", "geometric wolf"'),
      style: z.enum(['minimal-vector', 'app-icon', 'monogram', 'geometric-badge']).optional().default('geometric-badge').describe('Logo aesthetic preset'),
      colorHex: z.string().optional().default('#6366f1').describe('Hex color for the vector mark, e.g. #6366f1, #06b6d4, #10b981'),
      brandName: z.string().optional().describe('Brand name to add as vector typography below or beside the mark'),
      tagline: z.string().optional().describe('Subtitle or tagline, e.g. "INTELLIGENT VECTOR STUDIO"'),
      layout: z.enum(['stacked', 'horizontal', 'mark-only']).optional().default('stacked').describe('Brand layout arrangement'),
      letterSpacing: z.number().optional().default(4).describe('Letter spacing for brand typography in pixels'),
      turdsize: z.number().optional().default(3).describe('Speckle suppression area threshold (0-20px)'),
    },
    async (args) => {
      const result = generateMcpLogo({
        prompt: args.prompt,
        style: args.style as LogoStyle,
        colorHex: args.colorHex,
        brandName: args.brandName,
        tagline: args.tagline,
        layout: args.layout as BrandLayout,
        letterSpacing: args.letterSpacing,
        turdsize: args.turdsize,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                status: 'success',
                message: `Generated ${result.style} logo for "${result.prompt}"`,
                pathCount: result.pathCount,
                dimensions: `${result.width}x${result.height}`,
                color: result.colorHex,
                svg: result.svg,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // Tool 2: Recolor Vector Logo
  server.tool(
    'recolor_vector_logo',
    'Instantly recolors any SVG vector logo to a target hex color without re-rendering.',
    {
      svgString: z.string().describe('Raw SVG markup to recolor'),
      newColorHex: z.string().describe('New hex color, e.g. #06b6d4, #f59e0b, #10b981'),
    },
    async ({ svgString, newColorHex }) => {
      const recolored = recolorSvg(svgString, newColorHex);
      return {
        content: [
          {
            type: 'text',
            text: recolored,
          },
        ],
      };
    }
  );

  // Tool 3: Compose Brand Mockup
  server.tool(
    'compose_brand_mockup',
    'Combines an SVG vector mark with brand typography and layout layers.',
    {
      markSvg: z.string().describe('Raw SVG markup of the mark/icon'),
      brandName: z.string().describe('Brand name title'),
      tagline: z.string().optional().default('').describe('Tagline / subtitle'),
      fontFamily: z.string().optional().default("'Space Grotesk', sans-serif").describe('CSS font family for brand text'),
      layout: z.enum(['stacked', 'horizontal', 'mark-only']).optional().default('stacked').describe('Layout mode'),
      letterSpacing: z.number().optional().default(4).describe('Letter spacing in pixels'),
      colorHex: z.string().optional().default('#ffffff').describe('Brand text color hex'),
    },
    async (args) => {
      const config: TypographyConfig = {
        brandName: args.brandName,
        tagline: args.tagline || '',
        fontFamily: args.fontFamily,
        layout: args.layout as BrandLayout,
        letterSpacing: args.letterSpacing,
        colorHex: args.colorHex,
      };

      const composed = composeBrandSvg(args.markSvg, config);
      return {
        content: [
          {
            type: 'text',
            text: composed,
          },
        ],
      };
    }
  );

  // Tool 4: List Style Presets & Samples
  server.tool(
    'list_presets_and_samples',
    'Lists all available VectorForge style presets, negative prompt configs, and sample concepts.',
    {},
    async () => {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                presets: STYLE_PRESETS,
                sampleConcepts: SAMPLE_CONCEPTS,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  return server;
}

/**
 * Starts the server in STDIO mode (default) or Stateless HTTP mode if --http flag passed.
 */
export async function main() {
  const args = process.argv.slice(2);
  const httpArgIndex = args.indexOf('--http');

  if (httpArgIndex !== -1) {
    const port = parseInt(args[httpArgIndex + 1] || '3000', 10);
    startStatelessHttpServer(port);
  } else {
    // Default STDIO transport for CLI / Agents
    const server = createVectorForgeMcpServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('[VectorForge MCP] Server running on STDIO (Stateless Model Context Protocol 2026)');
  }
}

/**
 * 2026 Stateless HTTP Transport:
 * Each incoming HTTP POST request is treated independently with zero session affinity.
 */
function startStatelessHttpServer(port: number) {
  const httpServer = http.createServer(async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-mcp-version');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', protocol: 'mcp-2026-stateless', version: '1.0.0' }));
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });

      req.on('end', async () => {
        try {
          const jsonRpc = JSON.parse(body);
          const { method, params, id } = jsonRpc;

          // Dispatch statelessly
          if (method === 'tools/list') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                jsonrpc: '2.0',
                id,
                result: {
                  tools: [
                    { name: 'forge_vector_logo', description: 'Synthesizes vector logo SVG' },
                    { name: 'recolor_vector_logo', description: 'Recolors SVG paths' },
                    { name: 'compose_brand_mockup', description: 'Composes vector mark with typography' },
                    { name: 'list_presets_and_samples', description: 'Lists style presets and samples' },
                  ],
                },
              })
            );
            return;
          }

          if (method === 'tools/call') {
            const toolName = params?.name;
            const toolArgs = params?.arguments || {};

            if (toolName === 'forge_vector_logo') {
              const result = generateMcpLogo(toolArgs);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({
                  jsonrpc: '2.0',
                  id,
                  result: {
                    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
                  },
                })
              );
              return;
            }

            if (toolName === 'recolor_vector_logo') {
              const recolored = recolorSvg(toolArgs.svgString || '', toolArgs.newColorHex || '#6366f1');
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({
                  jsonrpc: '2.0',
                  id,
                  result: {
                    content: [{ type: 'text', text: recolored }],
                  },
                })
              );
              return;
            }

            if (toolName === 'compose_brand_mockup') {
              const composed = composeBrandSvg(toolArgs.markSvg || '', {
                brandName: toolArgs.brandName || '',
                tagline: toolArgs.tagline || '',
                fontFamily: toolArgs.fontFamily || "'Space Grotesk', sans-serif",
                layout: toolArgs.layout || 'stacked',
                letterSpacing: toolArgs.letterSpacing || 4,
                colorHex: toolArgs.colorHex || '#ffffff',
              });
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({
                  jsonrpc: '2.0',
                  id,
                  result: {
                    content: [{ type: 'text', text: composed }],
                  },
                })
              );
              return;
            }
          }

          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found' } }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' } }));
        }
      });
      return;
    }

    res.writeHead(404);
    res.end();
  });

  httpServer.listen(port, () => {
    console.error(`[VectorForge MCP] Stateless HTTP Server listening on port ${port}`);
  });
}

// Auto-run if executed directly
if (import.meta.url === `file://${process.argv[1]}`.replace(/\\/g, '/')) {
  main().catch((err) => {
    console.error('[VectorForge MCP] Fatal error:', err);
    process.exit(1);
  });
}
