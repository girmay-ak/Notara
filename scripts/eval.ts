/**
 * Note-quality evaluation harness — Rung 0 of the validation ladder.
 *
 * Runs sample transcripts through Claude (the note-generation half of the
 * pipeline) so we can judge KNGF/SOAP quality with ONLY an ANTHROPIC_API_KEY —
 * no audio, no Whisper, no UI. This is the cheapest way to validate the product.
 *
 *   cp .env.example .env.local   # add ANTHROPIC_API_KEY
 *   npm run eval                 # all fixtures
 *   npm run eval kngf-knie-01    # a single fixture by id
 *
 * Have a practicing physiotherapist grade the output. See docs/VALIDATION-PLAN.md.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { config } from "dotenv";
import { generateNote } from "../lib/ai/generate";
import { renderNote } from "../lib/ai/render";
import type { NoteFormat } from "../lib/ai/schemas";

config({ path: ".env.local" });
config({ path: ".env" });

const __dirname = dirname(fileURLToPath(import.meta.url));

interface Fixture {
  id: string;
  format: NoteFormat;
  language: string;
  profession: string;
  note: string;
  transcript: string;
}

const fixtures = JSON.parse(
  readFileSync(resolve(__dirname, "../fixtures/transcripts.json"), "utf8"),
) as Fixture[];

const filter = process.argv[2];
const selected = filter ? fixtures.filter((f) => f.id === filter) : fixtures;

const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;

async function run() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(red("ANTHROPIC_API_KEY is not set. Add it to .env.local."));
    process.exit(1);
  }
  if (selected.length === 0) {
    console.error(red(`No fixture matches "${filter}".`));
    process.exit(1);
  }

  let totalIn = 0;
  let totalOut = 0;
  let failures = 0;

  for (const fx of selected) {
    console.log("\n" + bold(`━━ ${fx.id} ━━ [${fx.format}/${fx.language}]`));
    console.log(dim(fx.note));
    console.log(dim(`Transcript: ${fx.transcript.slice(0, 120)}…`));

    const result = await generateNote({
      transcript: fx.transcript,
      format: fx.format,
      profession: fx.profession,
    });

    if (!result.ok) {
      failures++;
      console.log(red(`✗ ${result.error.code}: ${result.error.message}`));
      continue;
    }

    totalIn += result.data.inputTokens;
    totalOut += result.data.outputTokens;

    console.log(green("✓ valid structured note"));
    console.log("\n" + renderNote(result.data.content, fx.format));
    console.log(
      dim(
        `\n[tokens] in ${result.data.inputTokens} · out ${result.data.outputTokens}`,
      ),
    );
  }

  // Rough cost estimate (Sonnet 4.5: $3/MTok in, $15/MTok out).
  const cost = (totalIn / 1e6) * 3 + (totalOut / 1e6) * 15;
  console.log(
    "\n" +
      bold(
        `Done: ${selected.length - failures}/${selected.length} valid · est. Claude cost $${cost.toFixed(4)}`,
      ),
  );
  if (failures > 0) process.exit(1);
}

run().catch((e) => {
  console.error(red(String(e)));
  process.exit(1);
});
