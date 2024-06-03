import * as d3 from "d3";
import React, { useEffect, useRef } from "react";
import flare from "@/flare.json";
import files from "@/dataNoL3.json";

const width = 928;
const height = 600;
const data = files;

export default function HierarchicalEdgeBundling() {
  const graphHolderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const graphHolder = graphHolderRef.current;
    if (!graphHolder || graphHolder.hasChildNodes()) return;
  }, []);

  return (
    <div>
      <p>Force Directed graph</p>
      <div ref={graphHolderRef} />
    </div>
  );
}
