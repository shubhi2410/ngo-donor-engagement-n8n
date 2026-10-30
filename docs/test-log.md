# Test log

Tester: Shubhi Agarwal   Dates:30th September 2026 

## A. Single tests

|#|Test|Expected|Actual|Pass?|
|-|-|-|-|-|
|1|Airtable filter|8 items|8|Yes|
|2|25-day guard|7 items with Asha's Last Contacted set|7|Yes|
|3|Prompt contents|first name only, no email, no amount|As expected|Yes|
|4|One Groq call|valid JSON, subject and body|As expected|Yes|
|5|Parse Email gate|ok = true on a normal email|As expected|Yes|
|6|Full run|emails sent to eligible donors only|As expected|Yes|
|7|Inbox check|count matches sent; none for Divya and Imran|As expected|Yes|
|8|Airtable updated|Last Contacted and Last Email Sent filled|As expected|Yes|
|9|Immediate repeat run|0 donors processed|As expected|Yes|

## B. Full runs

|Run|Date|Donors found|Emails sent|Blocked by gate|Reasons for blocks|Warnings on sent emails|Seconds, start to finish|
|-|-|-|-|-|-|-|-|
|1|29th Oct 2026|10|8|2|Lapsed, Unenrolled|None||
|2|30th Oct 2026|10|0|10|Lapsed, Unenrolled, Already mailed|None||



## C. Problems found and fixes

|What went wrong|How I found it|What I changed|
|-|-|-|
|Groq node: “Credentials not found”|Error when I ran Execute step on node 5|Created a Header Auth credential, with name Authorization and value Bearer plus my Groq key, and selected it in the node|
|Groq returned 404 model\_not\_found for llama-3.3-70b-versatile|Error output of node 5|Groq shut that model down on 16 August 2026. Switched to the replacement Groq recommends, openai/gpt-oss-120b, and added reasoning\_effort: 'low' and max\_completion\_tokens: 2000 because it’s a reasoning model|
|Log Send: “Invalid input for ‘Donor Since’”|Error on the Airtable Update node|The node was sending a blank value to a date field. Removed every field from the mapping except id, Last Contacted and Last Email Sent|



