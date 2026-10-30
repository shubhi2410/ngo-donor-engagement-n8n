// ============================================================================
// n8n Code node: "Parse Email"
// Mode: Run Once for Each Item      Language: JavaScript
//
// Input : the Groq API response (from the HTTP Request node)
// Output: ok (true/false), reason, record_id, email, name, subject, body,
//         word_count, warnings, unexpected_numbers, raw_response
//
// This node is the safety gate. It sets ok = false (and the next IF node skips
// the donor) when the model's output is unusable or unsafe:
//   empty_response, json_parse_failed, missing_field, bad_length,
//   unexpected_numbers (a number the model invented), currency_symbol,
//   placeholder_leak, bad_email
// ============================================================================

// Details of this donor, saved by the Build Prompt node
const donor = $('Build Prompt').item.json;

const raw = String($json.choices?.[0]?.message?.content ?? '').trim();

function finish(ok, reason, extra) {
  return {
    json: Object.assign({
      ok: ok,
      reason: reason,
      record_id: donor.record_id,
      email: donor.email,
      name: donor.name,
      subject: '',
      body: '',
      word_count: 0,
      warnings: [],
      unexpected_numbers: [],
      raw_response: raw.slice(0, 1000)
    }, extra || {})
  };
}

if (!raw) return finish(false, 'empty_response');

// Models sometimes wrap JSON in ```json fences or add a sentence before it. Cut down to the {...} part.
const cleaned = raw.replace(/```json|```/gi, '').trim();
const start = cleaned.indexOf('{');
const end = cleaned.lastIndexOf('}');
let parsed;
try {
  parsed = JSON.parse(cleaned.slice(start, end + 1));
} catch (e) {
  return finish(false, 'json_parse_failed');
}

const subject = String(parsed.subject ?? '').trim();
const body = String(parsed.body ?? '').trim();
if (!subject || !body) return finish(false, 'missing_field');

const words = body.split(/\s+/).filter(Boolean).length;
const base = { subject: subject, body: body, word_count: words };

// Target is 90-130 words. Block only the clearly wrong ones, warn on the rest.
if (words < 40 || words > 220) return finish(false, 'bad_length', base);

// Currency symbols or words: the prompt forbids stating amounts.
if (/[$\u20B9\u20AC\u00A3]|\b(?:rs\.?|inr|usd|rupees?|dollars?)\b/i.test(subject + ' ' + body)) {
  return finish(false, 'currency_symbol', base);
}

// Leftover template placeholders such as {first_name}
if (/[{}]/.test(subject + body)) return finish(false, 'placeholder_leak', base);

// Any digit string that did not come from the donor data or the update line is treated as invented.
function numbersIn(text) {
  const found = String(text).match(/\d[\d,]*(?:\.\d+)?/g) || [];
  return found.map(x => String(parseFloat(x.replace(/,/g, ''))));
}
const allowed = new Set(donor.allowed_numbers || []);
const unexpected = Array.from(new Set(numbersIn(subject + ' ' + body).filter(n => !allowed.has(n))));
if (unexpected.length > 0) return finish(false, 'unexpected_numbers', Object.assign({}, base, { unexpected_numbers: unexpected }));

if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(donor.email || '')) return finish(false, 'bad_email', base);

// Soft checks: recorded as warnings, do not block sending.
const warnings = [];
if (words < 90 || words > 130) warnings.push('length_outside_90_130');
if (!/^dear\s/i.test(body)) warnings.push('no_dear_greeting');
if (subject.length >= 55) warnings.push('subject_55_or_longer');
if (/\*\*|^\s*[-*] /m.test(body)) warnings.push('markdown_in_body');
if (/!/.test(body)) warnings.push('exclamation_mark');

return finish(true, 'ok', Object.assign({}, base, { warnings: warnings }));
