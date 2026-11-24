---
name: icon-animal-motion
description: Animate animal icons in Ira Icons with plausible body-part movement. Use for animal bodies, faces, or isolated body parts when creating or refining an animated icon.
---

# Animal motion

**Move at least one visible body part the way that animal would actually move it.** Pick one recognizable gesture that fits the species, the view, and the pose. Start by naming the action and its source: “the dog turns its ear at the base,” not “the dog wiggles.”

- **Use what the icon shows.** A dog can wag a visible tail; a head-only dog can perk an ear. A cat can blink if its eyes are drawn, or flick a visible ear. A fish can flick its tail at the base; a bird, bee, or butterfly can flap visible wings from where they attach. Don't invent missing anatomy to force a gesture.
- **Keep parts attached.** Place the pivot at the joint or attachment point, not at the center of the part's bounding box. Bend a flexible tail rather than spinning it like a rigid lever if the silhouette calls for it. Keep the rest of the animal still unless the same action naturally moves it. Avoid detached outlines, visible seams, and motion that clashes with the animal's pose or perspective.
- **Keep the animal recognizable throughout.** Use enough motion to read at 16 px without exaggerating the joint's range or clipping the stroke. Don't use a whole-icon wobble, scale pulse, or stroke reveal as a substitute for body movement.
- **Set timing by the gesture.** Give a flick or blink a quick action and a readable rest. For swimming or flapping, make the cycle continuous at the seam. Don't fade out the animal to reset: return naturally to the starting pose or connect the end and start of the cycle.
- **Check what the icon depicts, not just its category.** A paw print is a mark, not a moving paw; a dog bowl and a toy horse are objects. Don't give these icons animal anatomy or force this rule onto them.

Use self-contained CSS with icon-scoped selectors and keyframes inside `prefers-reduced-motion: no-preference`. Without CSS or with reduced motion, show the full original pose. In a browser, check the attachment point at the extremes, legibility at 16, 20, and 24 px, and the transition across two loops. For existing icons, follow the preservation and review workflow in [icon-refiner](../icon-refiner/SKILL.md).
