import * as d3 from "d3";
import React, { useEffect, useRef } from "react";
import files from "@/data/tidyTreeNoL3.json";

const width = 928;
const data = files;

export default function TidyTree() {
  const barHolderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const barHolder = barHolderRef.current;
    if (!barHolder || barHolder.hasChildNodes()) return;

    const root = d3.hierarchy(data);
    const dx = 10;
    const dy = width / (root.height + 1);

    // Create a tree layout.
    const tree = d3.tree().nodeSize([dx, dy]);

    // Sort the tree and apply the layout.
    root.sort((a, b) => d3.ascending(a.name, b.name));
    // @ts-ignore
    tree(root);

    // Compute the extent of the tree. Note that x and y are swapped here
    // because in the tree layout, x is the breadth, but when displayed, the
    // tree extends right rather than down.
    let x0 = Infinity;
    let x1 = -x0;
    root.each((d) => {
      if (!d.x) return;
      if (d.x > x1) x1 = d.x;
      if (d.x < x0) x0 = d.x;
    });

    // Compute the adjusted height of the tree.
    const height = x1 - x0 + dx * 2;

    const svg = d3
      .select(barHolder)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-dy / 3, x0 - dx, width, height])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    const link = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5)
      .selectAll()
      .data(root.links())
      .join("path")
      .attr(
        "d",
        //@ts-ignore
        d3
          .linkHorizontal()
          //@ts-ignore
          .x((d) => d.y)
          //@ts-ignore
          .y((d) => d.x)
      );

    const node = svg
      .append("g")
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 3)
      .selectAll()
      .data(root.descendants())
      .join("g")
      .attr("transform", (d) => `translate(${d.y},${d.x})`);

    node
      .append("circle")
      .attr("fill", (d) => (d.children ? "#555" : "#999"))
      .attr("r", 2.5);

    node
      .append("text")
      .attr("dy", "0.31em")
      .attr("x", (d) => (d.children ? -6 : 6))
      .attr("text-anchor", (d) => (d.children ? "end" : "start"))
      //@ts-ignore
      //   .text((d) => `${d.data.name} ${d.data.size || ""}`)
      .text((d) => d.data.name)
      //text color
      .attr("fill", "black")

      .attr("stroke", "white")
      .attr("paint-order", "stroke")

      //change color on hover
      .on("mouseover", (e, d) => {
        d3.select(e.target).attr("fill", "blue");
      })
      .on("mouseout", (e, d) => {
        d3.select(e.target).attr("fill", "black");
      })
      .on("click", (event, d) => {
        window.open("https://www.google.com", "_blank");
      });
    d3;
  }, []);

  return <div ref={barHolderRef} />;
}
