# Test log

Fill in your own results. Leave nothing invented. A failed test recorded honestly is better than a blank.

Tester: \_\_\_\_\_\_\_\_\_\_\_\_   Dates: \_\_\_\_\_\_\_\_\_\_\_\_   n8n version (Help menu): \_\_\_\_\_\_\_\_\_\_\_\_

## A. Single tests

|#|Test|Expected|Actual|Pass?|
|-|-|-|-|-|
|1|Airtable filter|8 items|8|Yes|
|2|25-day guard|7 items with Asha's Last Contacted set|7|Yes|
|3|Prompt contents|first name only, no email, no amount|As expected|Yes|
|4|One Groq call|valid JSON, subject and body|||
|5|Parse Email gate|ok = true on a normal email|||
|6|Full run|emails sent to eligible donors only|||
|7|Inbox check|count matches sent; none for Divya and Imran|||
|8|Airtable updated|Last Contacted and Last Email Sent filled|||
|9|Immediate repeat run|0 donors processed|||

## B. Full runs

|Run|Date|Donors found|Emails sent|Blocked by gate|Reasons for blocks|Warnings on sent emails|Seconds, start to finish|
|-|-|-|-|-|-|-|-|
|1||||||||
|2||||||||
|3||||||||
|**Total**||||||||

Block rate = blocked / (sent + blocked) = \_\_\_\_\_\_ %

## C. Email review (read at least five)

|Donor|Opens with something specific?|Update matches impact area?|Any invented fact or number?|Word count|Tone OK?|Notes|
|-|-|-|-|-|-|-|
||||||||
||||||||
||||||||
||||||||
||||||||

Did the emails sound too similar to each other? \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## D. Problems found and fixes

|What went wrong|How I found it|What I changed|
|-|-|-|
||||

## E. KPIs for the README

|KPI from the case study|Measured value|How measured|
|-|-|-|
|Share of eligible donors contacted|\_\_\_\_ of \_\_\_\_|Run 1 counts|
|Cost per personalised email|$0 on the Groq free plan|Groq plan|
|Time per run|\_\_\_\_ seconds|n8n execution time|
|Renewal rate change|**not measured**|No real donors, so it cannot be measured|



