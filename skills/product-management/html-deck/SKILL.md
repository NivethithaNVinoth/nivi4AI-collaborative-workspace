---
name: html-deck
domain: product-management
description: Generate a self-contained HTML presentation deck with keyboard navigation, slide counter, and professional styling — shareable as a single file.
when_to_use: Request mentions deck, slides, presentation, pitch, executive summary as slides, stakeholder briefing as deck, or launch readout.
output: HTML Presentation Deck (self-contained HTML file in a code block)
stage: discovery
---

## Purpose
Produce a polished, browser-viewable slide deck that can be presented immediately or emailed as a single HTML file.

## Rules
- Output MUST be a single self-contained HTML file inside a ```html ... ``` code block.
- Minimum 8 slides; maximum 15.
- Arrow-key / click navigation between slides.
- Slide counter (e.g. "3 / 10") in the bottom right.
- Clean typography: large headline, supporting body, optional bullet list, optional data callout.
- Brand palette: dark navy (#0f172a) background, white text, coloured accent for highlights.
- Each slide type: Cover | Section Divider | Two-column | Data/Stat callout | Bullet list | Full-width image placeholder | Closing CTA.

## Slide structure (minimum)
1. Cover — Product name, tagline, presenter, date
2. Problem / Opportunity
3. Market Sizing
4. Proposed Solution (overview)
5. Key Features (3-up grid)
6. Customer Journey (visual steps)
7. Success Metrics / OKRs
8. Roadmap (Now / Next / Later)
9. Risks & Mitigations
10. Next Steps / Ask

## Output template
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{Product} — Deck</title>
  <style>/* all styles inline */</style>
</head>
<body>
  <div id="deck">
    <div class="slide active" id="s1">...</div>
    <div class="slide" id="s2">...</div>
  </div>
  <script>/* navigation logic */</script>
</body>
</html>
```
