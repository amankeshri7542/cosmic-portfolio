# Responsive verification

The accepted Cosmic Field Journal design is preserved. This pass fixes the mobile layout and narrow diagram columns.

- The phone hero grows with its content, reserving space for the satellite and its controls.
- The narrow header keeps the name, resume and menu on one line; short landscape screens use a shorter header and a scrollable navigation dialog.
- Transaction annotations flow below the receipt. Workflow annotations move below the steps when their diagram column is at most 400px wide, including tablet columns.
- Object sliders have a 44px actual input height. Touch form fields and phone archive search use 16px text; the delivery checkbox is larger on touch devices.

## Evidence

`scripts/verify-responsive.mjs`: **218 checks passed**, with no runtime errors. All seven pages were checked with disclosures expanded at 320×568, 360×800, 390×844, 430×932, 600×900, 760×1024, 761×1024, 820×1180, 1024×768, 667×375, 844×390, 1440×900, 1920×1080 and 2560×1440. Checks cover horizontal overflow, header collisions and diagram annotation overlap.

Touch emulation verifies the Blog menu link, circuit slider input away from the visual track, moiré adjustment, contact input sizes, landscape menu scrolling and narrow live-object spacing. Screenshots and machine-readable results are in `docs/qa/responsive/`.

The existing journal and refinement checks also passed: **61 + 21 checks**. Production build (including TypeScript), ESLint and `git diff --check` passed. Agent-browser confirmed the rebuilt preview renders its content and controls without an error overlay.

These are Chromium viewport and touch-emulation checks, not physical-device or Safari certification. No messages were sent and nothing was deployed.
