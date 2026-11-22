import designGuide from "../../../.agents/skills/icon-designer/references/design-guide.md?raw";

// Bundle the catalog on the server so deployed builds do not need the source tree.
const svgSources = import.meta.glob("../../../icons/*.svg", {
  query: "?raw", import: "default", eager: true,
});

export const iconDesignContext = {
  designGuide,
  readReference: (name) => svgSources[`../../../icons/${name}.svg`],
};
