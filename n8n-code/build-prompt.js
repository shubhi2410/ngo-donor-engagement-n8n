// ============================================================================
// n8n Code node: "Build Prompt"
// Mode: Run Once for Each Item      Language: JavaScript
//
// Input : one Airtable donor record (arrives from the Loop Over Items node)
// Output: record_id, name, email, impact_area, allowed_numbers, groq_request
//         (groq_request is the JSON body sent to the Groq API in the next node)
//
// Privacy choice: only the FIRST NAME, impact area, giving-since year, last-gift
// month and the personal note are sent to Groq. Email address, surname and
// the amount given are NOT sent.
//
// The system prompt below is identical to prompts/system-prompt.txt.
// The update lines below are identical to prompts/impact-updates.json.
// ============================================================================

const SYSTEM_PROMPT = "You write short donor update emails for a small non-profit called Hope Foundation.\n\nRules:\n- Write 90 to 130 words in the body. No more.\n- Begin the body with \"Dear <first name>,\" using only the first name you are given.\n- Open with something specific to this donor: their impact area, the year they began giving, or the personal note you are given. If you mention how long they have given, say \"since <year>\" using the year provided. Do not calculate a number of years.\n- Share exactly one update, taken only from the line labelled \"Update for this donor's impact area\". Never invent statistics, amounts, project names, dates or events.\n- Never state or guess how much the donor has given. Never use a currency symbol. You may call them a long-time or recent supporter.\n- Thank them plainly. Do not use the phrases \"valued partner\" or \"we are humbled\". No exclamation marks.\n- Close with one light, low-pressure line. Do not ask for money.\n- Plain text only. No markdown and no bullet points.\n- End the body with the sign-off \"Priya Nair\" on one line and \"Hope Foundation\" on the next line.\n\nReturn ONLY a JSON object, with no text before or after it, in exactly this shape:\n{\"subject\": \"...\", \"body\": \"...\"}\n\nThe subject must be under 55 characters.";

const IMPACT_UPDATES = {
  "Education": "The after-school programme reopened in three villages and 240 children are now enrolled.",
  "Clean Water": "Two new borehole wells were completed and tested this month.",
  "Healthcare": "The mobile clinic completed its first full quarter of monthly visits.",
  "Food Security": "The community kitchen now serves 180 meals a day, up from 120.",
  "Women's Shelter": "The shelter added four beds and a full-time counsellor."
};

// Used when a donor's impact area has no update line. Contains no numbers on purpose.
const FALLBACK_UPDATE = "Hope Foundation continues its work across all of its programme areas this month.";

const rec = $json;
// The Airtable node can return fields at the top level or inside "fields". Handle both.
const f = rec.fields ? rec.fields : rec;

const fullName = String(f['Name'] || '').trim();
const firstName = fullName.split(/\s+/)[0] || 'friend';
const email = String(f['Email'] || '').trim();
const area = String(f['Impact Area'] || '').trim();
const donorSince = String(f['Donor Since'] || '');
const lastGift = String(f['Last Gift Date'] || '');
const notes = String(f['Notes'] || '').trim();

const givingSinceYear = donorSince.slice(0, 4) || 'unknown';
const lastGiftYearMonth = lastGift.slice(0, 7) || 'unknown';
const updateLine = IMPACT_UPDATES[area] || FALLBACK_UPDATE;

const userPrompt =
  'First name: ' + firstName + '\n' +
  'Impact area: ' + (area || 'not specified') + '\n' +
  'Giving since: ' + givingSinceYear + '\n' +
  'Last gift: ' + lastGiftYearMonth + '\n' +
  'Personal note: ' + (notes || 'none') + '\n\n' +
  "Update for this donor's impact area:\n" + updateLine + '\n\n' +
  'Write the email now. Return only the JSON object.';

// Numbers the email is allowed to contain: those in the update line and in the donor's own data.
// The Parse Email node blocks any email containing a number that is not in this list.
function numbersIn(text) {
  const found = String(text).match(/\d[\d,]*(?:\.\d+)?/g) || [];
  return found.map(x => String(parseFloat(x.replace(/,/g, ''))));
}
const allowedNumbers = Array.from(new Set(
  numbersIn(updateLine).concat(numbersIn(donorSince), numbersIn(lastGift), numbersIn(notes))
));

return {
  json: {
    record_id: rec.id,
    name: fullName,
    email: email,
    impact_area: area,
    allowed_numbers: allowedNumbers,
    groq_request: {
      model: 'llama-3.3-70b-versatile',
      temperature: 0.6,
      max_tokens: 500,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ]
    }
  }
};
