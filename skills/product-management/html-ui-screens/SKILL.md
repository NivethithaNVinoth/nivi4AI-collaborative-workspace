---
name: html-ui-screens
domain: product-management
description: Generate a self-contained interactive HTML file showing key mobile UI screens with realistic UI components, navigation, and theming. No external dependencies.
when_to_use: Request mentions UI, UX, screens, wireframes, mobile app, prototype, design mockups, or visual journey.
output: Interactive HTML Prototype (self-contained HTML file in a code block)
stage: discovery
---

## Purpose
Produce a clickable, browser-viewable HTML prototype that PMs, designers, and stakeholders can open immediately — no Figma, no tools needed.

## Rules
- Output MUST be a single self-contained HTML file inside a ```html ... ``` code block.
- No external CSS or JS dependencies (everything inline or in <style>/<script> tags).
- Show a minimum of 4 distinct mobile screens, navigable via tab buttons above the phone frame.
- Phone frame: 390px wide, min-height 844px, dark border/shadow to simulate a device.
- Status bar at top (carrier, time, battery icons).
- Bottom navigation bar with 4 icons.
- Use the product's brand colours inferred from the brief. Default: deep navy #1a1f5e + orange accent #f97316.
- Content must be realistic — actual screen copy, not Lorem Ipsum.

## Screen checklist
For a credit card product: Landing/Hero, Application Form, Card Dashboard, Rewards Catalog.
For a SaaS product: Landing, Sign-up, Main Dashboard, Settings.
For a marketplace: Home, Browse/Search, Product Detail, Checkout.

## Output template
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{Product} — UI Prototype</title>
  <style>
    /* all styles inline */
  </style>
</head>
<body>
  <!-- screen navigation buttons -->
  <!-- phone frame with screen divs -->
  <script>
    // screen switching logic
  </script>
</body>
</html>
```
