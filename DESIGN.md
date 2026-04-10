# Design System Strategy: Neon Editorial

## 1. Overview & Creative North Star: "The Electric Gallery"
This design system moves away from the "educational app" stereotype and toward a high-end, immersive digital gallery. Our North Star is **The Electric Gallery**. We treat each quiz question not as a form to be filled, but as a premium editorial layout. 

To achieve this, we reject the rigid, centered grids of standard apps in favor of **intentional asymmetry** and **dynamic depth**. By overlapping typography with glowing containers and utilizing vast tonal shifts in our deep violet spectrum, we create an environment that feels expensive, energetic, and atmospheric. We are not just building a quiz; we are building a "flow state" experience where the UI recedes and the interaction shines.

## 2. Colors & Surface Philosophy
The palette is built on a foundation of deep, ink-like violets, punctuated by "Electric Accents" that serve as functional signposts.

### The "No-Line" Rule
**Borders are a failure of hierarchy.** Within this system, 1px solid borders are strictly prohibited for sectioning or containment. Boundaries must be defined through:
*   **Tonal Transitions:** A `surface-container-high` element sitting on a `surface` background.
*   **Luminous Glows:** Using `primary-dim` or `secondary-dim` as a soft outer glow (16px - 32px blur at 10% opacity) to define an interactive area.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers of polished obsidian and frosted glass.
*   **The Base Layer:** Use `surface` (#110334) for the main application canvas.
*   **The Submerged Layer:** Use `surface-container-lowest` for background areas that need to feel "recessed" or less important.
*   **The Floating Layer:** Use `surface-container-high` or `highest` for quiz cards. This creates a "lifted" effect through color value alone, rather than relying on heavy shadows.

### The "Glass & Gradient" Rule
To add "soul" to the digital interface:
*   **Glassmorphism:** Floating action headers or navigation bars should use `surface-variant` at 60% opacity with a `20px` backdrop-blur.
*   **Signature Textures:** Main CTAs should never be flat. Use a linear gradient from `primary` (#b6a0ff) to `primary-dim` (#7e51ff) at a 135-degree angle to provide a sense of volume and energy.

## 3. Typography: Bold Editorial
We use **Plus Jakarta Sans** for its geometric clarity and modern, "tech-forward" spirit.

*   **Display (lg/md):** Reserved for score tallies or "Correct/Incorrect" feedback. Use `display-lg` with tight letter-spacing (-0.02em) to create a punchy, poster-like feel.
*   **Headlines (lg/md):** Used for the quiz questions. These should be high-contrast (`on-surface`). Don't be afraid to use `headline-lg` for short questions to create an editorial impact.
*   **Titles (lg/md):** Used for category names and card headers. 
*   **Body (lg/md):** Use `body-lg` for option text within cards. Ensure a line-height of 1.5 for maximum readability during timed sessions.
*   **Labels:** Used for metadata (e.g., "Question 5 of 20"). Always use uppercase with 0.05em letter-spacing for a "pro" utility look.

## 4. Elevation & Depth
Depth in this system is a product of light and layering, not artificial dividers.

*   **The Layering Principle:** Stack `surface-container-low` for secondary information and `surface-container-highest` for the active focus element. This "Value Stacking" guides the eye without cluttering the screen.
*   **Ambient Shadows:** When a card must float (e.g., a modal or a results summary), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4)`. The shadow should feel like a soft weight, not a dark outline.
*   **The "Ghost Border" Fallback:** If a boundary is visually required for accessibility, use the `outline-variant` (#4c4071) at **15% opacity**. This creates a "whisper" of an edge that disappears into the background.

## 5. Components

### Quiz Option Cards
*   **Structure:** Use `surface-container-high` with a `md` (1.5rem) corner radius.
*   **Interaction:** On hover/focus, transition the background to `surface-bright` and add a 1px "Ghost Border" using the specific accent color (e.g., `secondary` for a teal option).
*   **Forbid Dividers:** Do not use lines between options. Use `1rem` of vertical whitespace.

### Primary Buttons (Action CTAs)
*   **Style:** `xl` (3rem) rounded corners. 
*   **Color:** Gradient of `primary` to `primary-dim`.
*   **Typography:** `title-md` in `on-primary` (deep violet).
*   **Glow:** Apply a subtle drop shadow using the `primary` color at 20% opacity to make the button look "charged" with energy.

### Progress Indicators
*   **Track:** `surface-container-lowest`.
*   **Indicator:** A glowing gradient of `secondary` to `primary`.
*   **Motion:** Use a "spring" easing function (0.4, 0, 0.2, 1.5) for the bar's growth to feel playful and gamified.

### Selection Chips (Category Filters)
*   **Style:** `full` (9999px) rounded corners.
*   **Unselected:** `surface-container-low` with `on-surface-variant` text.
*   **Selected:** `tertiary` background with `on-tertiary` (dark brown) text. This high-contrast flip provides immediate visual feedback.

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical margins. For example, a question could be slightly offset to the left while the options are nested to the right.
*   **Do** use the `secondary`, `tertiary`, and `error` colors to color-code different quiz categories or states (Success/Warning/Error).
*   **Do** leverage "Negative Space" as a functional tool. Let the deep violet background breathe.

### Don't
*   **Don't** use pure white (#FFFFFF) for text. Use `on-surface` (#ebe1ff) to maintain the atmospheric violet tint.
*   **Don't** use standard 4px or 8px "Material" shadows. They look muddy on dark backgrounds. Stick to Tonal Layering.
*   **Don't** use sharp 90-degree corners. Everything in this system should feel "haptic" and approachable, using the `DEFAULT` (1rem) to `xl` (3rem) rounding scale.