//@ts-nocheck
import * as d3 from "d3";
import React, { useEffect, useState, useRef } from "react";
import myData from "@/data/HierarchicalEdgeBundlingL3V2.json";

const colornone = "#ccc";
const colorout = "#f00";
const colorin = "#00f";

function buildHierarchy(data, delimiter = ".") {
  let root = {
    name: "root",
    children: [],
  };

  for (const record of data) {
    const { name, size, linkTo } = record;
    const parts = name.split(delimiter);
    const l0 = parts[1];
    const l1 = parts[2];
    const l2 = parts[3];

    //try to add l0
    let level0 = root.children.find((c) => c.name === l0);
    if (!level0) {
      const newItem = {
        name: l0,
        children: [],
      };
      root.children.push(newItem);
    }

    //try to add l1
    let level1 = root.children
      .find((c) => c.name === l0)
      .children.find((c) => c.name === l1);
    if (!level1) {
      const newItem = {
        name: l1,
        children: [],
      };
      root.children.find((c) => c.name === l0).children.push(newItem);
    }

    //try to add l2
    let level2 = root.children
      .find((c) => c.name === l0)
      .children.find((c) => c.name === l1)
      .children.find((c) => c.name === l2);
    if (!level2) {
      const newItem = {
        name: l2,
        size,
        linkTo,
      };
      root.children
        .find((c) => c.name === l0)
        .children.find((c) => c.name === l1)
        .children.push(newItem);
    }
  }
  return root;
}

const chart = (inputData: any) => {
  const data = buildHierarchy(inputData);

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

  const [data, setData] = useState(myData);

  const [listL0, setListL0] = useState<{ value: string; selected: boolean }[]>(
    []
  );
  const [listL1, setListL1] = useState<{ value: string; selected: boolean }[]>(
    []
  );
  const [listL2, setListL2] = useState<{ value: string; selected: boolean }[]>(
    []
  );
  const [maxNodeSize, setMaxNodeSize] = useState(0);
  const [currentMaxNodeSize, setCurrentMaxNodeSize] = useState(0);
  const [currentMinNodeSize, setCurrentMinNodeSize] = useState(0);

  const [relations, setRelations] = useState<{
    value: string;
    selected: boolean;
  }>([]);

  //collect filter data
  useEffect(() => {
    const l0 = data.map((d) => d.L0);
    const l1 = data.map((d) => d.L1);
    const l2 = data.map((d) => d.L2);

    const listL0 = Array.from(new Set(l0)).map((value) => ({
      value,
      selected: true,
    }));
    const listL1 = Array.from(new Set(l1)).map((value) => ({
      value,
      selected: true,
    }));
    const listL2 = Array.from(new Set(l2)).map((value) => ({
      value,
      selected: true,
    }));

    setListL0(listL0);
    setListL1(listL1);
    setListL2(listL2);

    //get max node size
    const maxNodeSize = Math.max(...data.map((d) => d.size));
    setMaxNodeSize(maxNodeSize);
    setCurrentMaxNodeSize(maxNodeSize);

    //get unique relations
    const relations = [];

    data.forEach((d) => {
      d.relations.forEach((relation) => {
        if (!relations.find((r) => r.value === relation)) {
          relations.push({ value: relation, selected: true });
        }
      });
    });

    setRelations(relations);
  }, []);

  //apply filter
  useEffect(() => {
    console.log("apply filter");
    if (listL0.length === 0) return;

    const newData = [];

    //extract selected L0 categories
    const selectedCategoriesL0 = listL0
      .filter((l0) => l0.selected)
      .map((l0) => l0.value);

    const selectedCategoriesL1 = listL1
      .filter((l1) => l1.selected)
      .map((l1) => l1.value);

    const selectedCategoriesL2 = listL2
      .filter((l2) => l2.selected)
      .map((l2) => l2.value);

    const selectedRelations = relations
      .filter((relation) => relation.selected)
      .map((relation) => relation.value);

    //remove unselected categories
    myData.forEach((d) => {
      if (
        selectedCategoriesL0.includes(d.L0) &&
        selectedCategoriesL1.includes(d.L1) &&
        selectedCategoriesL2.includes(d.L2) &&
        d.size <= currentMaxNodeSize &&
        d.size >= currentMinNodeSize &&
        d.relations.some((relation) => selectedRelations.includes(relation))
      ) {
        newData.push(d);
      }
    });

    //remove links to not to show nodes
    newData.forEach((element) => {
      element.linkTo = element.linkTo.filter((link) =>
        newData.find((d) => d.name === link)
      );
    });

    setData(newData);
  }, [
    listL0,
    listL1,
    listL2,
    currentMaxNodeSize,
    currentMinNodeSize,
    relations,
  ]);

  //render chart
  useEffect(() => {
    console.log("try render chart");
    const holder = holderRef.current;
    if (data.length === 0) {
      holder.innerHTML = "";
      return;
    }

    console.log("render chart");
    const svg = chart(data);

    //remove old svg
    holder.innerHTML = "";
    holder.appendChild(svg);
  }, [data]);

  const [filterType, setFilterType] = useState(0);

  return (
    <div className="flex items-start">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <div className="flex items-center mb-4">
            <button
              className={`mr-2 px-4 py-2 ${
                filterType === 0
                  ? "bg-blue-500 text-white rounded"
                  : "bg-gray-300 text-gray-700 rounded"
              }`}
              onClick={() => setFilterType(0)}
            >
              L0
            </button>
            <button
              className={`mr-2 px-4 py-2 ${
                filterType === 1
                  ? "bg-blue-500 text-white rounded"
                  : "bg-gray-300 text-gray-700 rounded"
              }`}
              onClick={() => setFilterType(1)}
            >
              L1
            </button>
            <button
              className={`mr-2 px-4 py-2 ${
                filterType === 2
                  ? "bg-blue-500 text-white rounded"
                  : "bg-gray-300 text-gray-700 rounded"
              }`}
              onClick={() => setFilterType(2)}
            >
              L2
            </button>
          </div>
          <div>
            {filterType === 0 && filterList(listL0, setListL0)}
            {filterType === 1 && filterList(listL1, setListL1)}
            {filterType === 2 && filterList(listL2, setListL2)}
          </div>
        </div>

        <div>
          <p>Max Node Size: {currentMaxNodeSize}</p>

          <input
            className="w-full"
            type="range"
            min="0"
            max={maxNodeSize}
            value={currentMaxNodeSize}
            onChange={(e) => setCurrentMaxNodeSize(e.target.value)}
          />

          <p>Min Node Size: {currentMinNodeSize}</p>

          <input
            className="w-full"
            type="range"
            min="0"
            max={maxNodeSize}
            value={currentMinNodeSize}
            onChange={(e) => setCurrentMinNodeSize(e.target.value)}
          />
        </div>

        <div>
          <p>Relations</p>
          <div className="flex flex-col gap-1">
            {relations.map((relation, index) => (
              <div
                key={index}
                className="flex items-center select-none hover:bg-gray-100 px-2 py-1 rounded hover:cursor-pointer "
                onClick={() => {
                  const newRelations = [...relations];
                  newRelations[index].selected = !newRelations[index].selected;
                  setRelations(newRelations);
                }}
              >
                <div
                  className={`mr-2 w-4 h-4 rounded-full ${
                    relation.selected ? "bg-blue-500" : "bg-gray-300"
                  }`}
                />
                <p className="text-gray-700 text-xs">{relation.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mb-4" ref={holderRef} />
    </div>
  );
}

const filterList = (list, setList) => {
  return (
    <div className="">
      {list.map((item, index) => (
        <div key={index} className="flex flex-col">
          <div
            className="flex items-center hover:bg-gray-100  px-2 py-1 rounded hover:cursor-pointer select-none"
            onClick={() => {
              const newList = [...list];
              newList[index].selected = !newList[index].selected;
              setList(newList);
            }}
          >
            <div
              className={`mr-2 w-4 h-4 rounded-full ${
                item.selected ? "bg-blue-500" : "bg-gray-300"
              }`}
            />
            <p className="text-gray-700 text-xs">{item.value}</p>
          </div>
          <div className="h-[2px] w-full bg-gray-300"></div>
        </div>
      ))}
    </div>
  );
};
