"use client";

import ChartWrapper from "./components/chartWrapper";
import HierarchicalEdgeBundlingL1 from "./components/charts/HierarchicalEdgeBundlingL1";
import HierarchicalEdgeBundlingL2 from "./components/charts/HierarchicalEdgeBundlingL2";
import HierarchicalEdgeBundlingL3 from "./components/charts/HierarchicalEdgeBundlingL3";
import TidyTree from "./components/charts/tidyTree";

export default function Home() {
  return (
    <div className="w-full flex flex-col">
      <ChartWrapper title="Tidy tree">
        <TidyTree />
      </ChartWrapper>

      <ChartWrapper title="Hierarchical edge bundling L3">
        <HierarchicalEdgeBundlingL3 />
      </ChartWrapper>
    </div>
  );
}
