//@ts-nocheck
import * as d3 from "d3";
import React, { useEffect, useState, useRef } from "react";

import myData from "@/data/HierarchicalEdgeBundlingL3.json";

const colornone = "#ccc";
const colorout = "#f00";
const colorin = "#00f";

const data = hierarchy(myData);

const chart = () => {
  const width = 1700;
  const radius = width / 2;

  const tree = d3.cluster().size([2 * Math.PI, radius - 400]);
  const root = tree(
    bilink(
      d3
        .hierarchy(data)
        .sort(
          (a, b) =>
            d3.ascending(a.height, b.height) ||
            d3.ascending(a.data.name, b.data.name)
        )
    )
  );

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", width)
    .attr("viewBox", [-width / 2, -width / 2, width, width])
    .attr("style", "width: 100%; height: 100%; font: 1em sans-serif;");

  const node = svg
    .append("g")
    .selectAll()
    .data(root.leaves())
    .join("g")
    .on("mouseover", overed)
    .on("mouseout", outed)
    .on("click", (event, d) => {
      window.open("https://www.google.com", "_blank");
    })
    .attr(
      "transform",
      (d) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0)`
    )
    .append("text")
    .attr("dy", "0.31em")
    .attr("x", (d) => (d.x < Math.PI ? 6 : -6))
    .attr("text-anchor", (d) => (d.x < Math.PI ? "start" : "end"))
    .attr("transform", (d) => (d.x >= Math.PI ? "rotate(180)" : null))
    .text((d) => d.data.name)
    .each(function (d) {
      d.text = this;
    })
    .call((text) =>
      text.append("title").text(
        (d) => `${id(d)}
${d.outgoing.length} outgoing
${d.incoming.length} incoming`
      )
    );

  const line = d3
    .lineRadial()
    .curve(d3.curveBundle.beta(0.85))
    .radius((d) => d.y)
    .angle((d) => d.x);

  const link = svg
    .append("g")
    .attr("stroke", colornone)
    .attr("fill", "none")
    .selectAll()
    .data(root.leaves().flatMap((leaf) => leaf.outgoing))
    .join("path")
    .style("mix-blend-mode", "multiply")
    .attr("d", ([i, o]) => line(i.path(o)))
    .each(function (d) {
      d.path = this;
    });

  function overed(event, d) {
    console.log("overed");

    link.style("mix-blend-mode", null);
    d3.select(this).attr("font-weight", "bold").attr("font-size", "1.5em");
    d3.selectAll(d.incoming.map((d) => d.path))
      .attr("stroke", colorin)
      .raise();
    d3.selectAll(d.incoming.map(([d]) => d.text))
      .attr("fill", colorin)
      .attr("font-weight", "bold");
    d3.selectAll(d.outgoing.map((d) => d.path))
      .attr("stroke", colorout)
      .raise();
    d3.selectAll(d.outgoing.map(([, d]) => d.text))
      .attr("fill", colorout)
      .attr("font-weight", "bold");
  }

  function outed(event, d) {
    link.style("mix-blend-mode", "multiply");
    d3.select(this).attr("font-weight", null).attr("font-size", null);
    d3.selectAll(d.incoming.map((d) => d.path)).attr("stroke", null);
    d3.selectAll(d.incoming.map(([d]) => d.text))
      .attr("fill", null)
      .attr("font-weight", null);
    d3.selectAll(d.outgoing.map((d) => d.path)).attr("stroke", null);
    d3.selectAll(d.outgoing.map(([, d]) => d.text))
      .attr("fill", null)
      .attr("font-weight", null);
  }

  return svg.node();
};

function hierarchy(data, delimiter = ".") {
  let root;
  const map = new Map();
  data.forEach(function find(data) {
    const { name } = data;
    if (map.has(name)) return map.get(name);
    const i = name.lastIndexOf(delimiter);
    map.set(name, data);
    if (i >= 0) {
      find({ name: name.substring(0, i), children: [] }).children.push(data);
      data.name = name.substring(i + 1);
    } else {
      root = data;
    }
    return data;
  });
  return root;
}

function bilink(root) {
  const map = new Map(root.leaves().map((d) => [id(d), d]));
  for (const d of root.leaves())
    (d.incoming = []), (d.outgoing = d.data.linkTo.map((i) => [d, map.get(i)]));
  for (const d of root.leaves())
    for (const o of d.outgoing) o[1].incoming.push(o);
  return root;
}

function id(node) {
  return `${node.parent ? id(node.parent) + "." : ""}${node.data.name}`;
}

export default function HierarchicalEdgeBundlingL3() {
  const holderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const svg = chart();
    const holder = holderRef.current;
    if (!holder || holder.hasChildNodes() || !svg) return;

    holder.appendChild(svg);
  }, []);

  return <div ref={holderRef}></div>;
}
