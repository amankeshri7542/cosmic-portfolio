## Skills & References

### Task 1 — Saffron Color System
```
Add #E8A045 as a CSS variable --color-saffron to globals.css under the :root block. 
Also add a utility class .text-saffron { color: #E8A045; } and .border-saffron { 
border-color: rgba(232,160,69,0.4); } in the @layer utilities block. Don't touch 
any existing variables.
```

---

### Task 2 — Typewriter Lines Update
```
In app/page.tsx, find the Typewriter component's strings array. 
Replace it with these exact three strings:
- 'A JS developer 💻'
- 'RAM BHAKT || Lives inside AWS Clouds ☁️'
- 'Building the Brahmaand, one Lambda at a time 🕉️'
Change nothing else in the file.
```

---

### Task 3 — Mandala Behind Profile Photo
```
In app/page.tsx, inside the hero section, find the profile image wrapper div 
(the relative w-40 h-40 div). Add an SVG mandala ring BEHIND the image using 
absolute positioning. The mandala should be:
- A rotating dharma chakra with 8 spokes and two concentric rings
- Color: #E8A045 at 50% opacity  
- Animation: CSS spin 25s linear infinite
- Size: slightly larger than the image (110% of container)
- Position: absolute, centered, z-index behind the image
Use only inline SVG + a <style> tag for the keyframe. No new dependencies.
```

---

### Task 4 — Ram Quote Section
```
In app/page.tsx, add a new full-width section between the "About Me" section 
and the "Tech Stack Cards" section. It should contain:
- A thin saffron horizontal line (40px wide, centered, 1px height, #E8A045, 60% opacity)
- Small uppercase label "My Dharma" in saffron, letter-spacing 0.2em, 12px
- Sanskrit text: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन" — white, 16px, italic, centered
- English translation: "You have the right to work, never to its fruits." — #E8A045, 13px
- Citation: "— Bhagavad Gita 2.47" — white at 30% opacity, 11px
- Another thin saffron line at the bottom
Wrap in a motion.div with whileInView fade-in. Use the glass-cosmic class as container, 
max-width 3xl, centered. No new components — inline in page.tsx.
```

---

### Task 5 — IT Brahmaand Galaxy Section
```
Create a new component components/BrahmaandGalaxy.tsx. It should be an interactive 
SVG solar system with:
- Center node: "You" with a small pulsing circle
- 3 orbit rings with animated planets:
  Orbit 1 (cyan): Cloud planet → links to /work and scrolls to Serverless Notification project
  Orbit 2 (purple): GenAI planet → links to /work and scrolls to Mythos AI project  
  Orbit 2 (purple): DevOps planet → links to /work  
  Orbit 3 (saffron): Next.js moon → links to /work and scrolls to Shiv Cement project
- Planets should pause animation on hover and show a tooltip with 2-3 skill names
- Orbit rings are dashed, low opacity
- Dark background matching cosmic theme
- Use CSS animations only, no GSAP or framer for the orbits
- Add 'use client' directive
Then import and add this component in app/page.tsx, replacing the 3 tech stack cards grid. 
Add a section heading "The Brahmaand — IT Universe" with text-glow-white class.
```

---

### Task 6 — Custom Cursor
```
Create components/CosmicCursor.tsx with 'use client' directive. 
Implement a custom cursor with:
- A small 8px glowing dot that follows the mouse, color #8b5cf6 with box-shadow glow
- A saffron (#E8A045) trail effect: on mousemove, create a temporary span element, 
  position it at cursor coords, animate it fading out over 400ms, then remove it from DOM
- The trail spans should be 4px circles, start at 70% opacity, fade to 0
- Hide the default cursor on the entire page via CSS cursor: none on body
- Restore cursor: auto when hovering over <a> and <button> tags
- Clean up all event listeners on component unmount
Import and add <CosmicCursor /> in app/layout.tsx before the children render.
```

---

### Task 7 — Scroll Progress Bar Update
```
In components/ScrollProgress.tsx, find the background gradient in the inline style. 
Change it from:
'linear-gradient(90deg, #8b5cf6, #3b82f6, #22d3ee)'
To:
'linear-gradient(90deg, #8b5cf6, #E8A045 33%, #3b82f6 66%, #22d3ee)'
Change nothing else in the file.
```

---

### Task 8 — Footer Watermark
```
In components/Footer.tsx, find the copyright section div at the bottom 
(the border-t border-purple-500/20 div). Add a new centered paragraph ABOVE 
the existing copyright text with:
- Content: "🙏 Jai Shri Ram"
- Style: font-size 11px, color #E8A045 at 20% opacity, text-center, font-weight 400
- No hover effects, no animation
```

---

### Security Task 1 — HTML Injection Fix in Contact Route
```
In app/api/contact/route.ts, before the transporter.sendMail call, add a 
helper function escapeHtml(str: string): string that replaces these characters:
& → &amp;  < → &lt;  > → &gt;  " → &quot;  ' → &#039;
Apply escapeHtml() to the name, email, and message variables before they 
are interpolated into the HTML email template string. The function should 
be defined at the top of the file, outside the handler.
```

---

### Security Task 2 — Prompt Injection Sanitization
```
In app/api/generate-image/route.ts, after the cleanName variable is defined, 
add a sanitization step:
1. Strip any characters that aren't letters, spaces, hyphens, or apostrophes 
   using a regex replace
2. Collapse multiple spaces to single space
3. Check if the cleaned name contains any of these red-flag patterns (case-insensitive): 
   'ignore', 'forget', 'system', 'prompt', 'instruction', 'jailbreak', 'bypass'
   If found, return a 400 response: { error: 'Invalid name provided.' }
4. Also enforce that after sanitization the name is still at least 2 characters long
Apply this before the SPECIAL_CASES check.
```

---

### Security Task 3 — Log Visitor Input Hardening
```
In app/api/log-visitor/route.ts, after the cleanName and cleanLocation variables 
are defined, add:
1. A regex check on cleanName: only allow letters, spaces, hyphens, apostrophes, 
   periods. Reject with 400 if it fails.
2. Cap cleanLocation to 100 characters (currently 255 — unnecessarily large for 
   a city name)
3. Add a check: if the request body is larger than 1KB, return 400 immediately 
   before parsing. Use request.headers.get('content-length') for this.