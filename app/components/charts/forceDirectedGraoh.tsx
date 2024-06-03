import * as d3 from "d3";
import React, { useEffect, useRef } from "react";
import flare from "@/flare.json";
import files from "@/dataNoL3.json";

const width = 928;
const height = 600;
const data = files;

export default function ForceDirectedGraph() {
  const graphHolderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const graphHolder = graphHolderRef.current;
    if (!graphHolder || graphHolder.hasChildNodes()) return;

    // Specify the color scale.
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // The force simulation mutates links and nodes, so create a copy
    // so that re-evaluating this cell produces the same result.
    // const links = data.links.map((d) => ({ ...d }));
    // const nodes = data.nodes.map((d) => ({ ...d }));
  }, []);

  return (
    <div>
      <p>Force Directed graph</p>
      <div ref={graphHolderRef} />
    </div>
  );
}
