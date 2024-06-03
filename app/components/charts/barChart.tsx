import React, { Component, useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const data: {
  letter: string;
  frequency: number;
}[] = [
  {
    letter: "A",
    frequency: 0.08167,
  },
  {
    letter: "B",
    frequency: 0.01492,
  },
  {
    letter: "C",
    frequency: 0.02782,
  },
  {
    letter: "D",
    frequency: 0.04253,
  },
  // Add more letters here
];

const width = 640;
const height = 400;
const marginTop = 20;
const marginRight = 20;
const marginBottom = 30;
const marginLeft = 40;

const barWidth = 40;

export default function Barchart() {
  const barHolderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const barHolder = barHolderRef.current;
    if (!barHolder || barHolder.hasChildNodes()) return;

    // Declare the x (horizontal position) scale.
    const x = d3
      .scaleBand()

      //* this allows to vertically sort the bars by frequency
      .domain(
        d3.groupSort(
          data,
          ([d]) => -d.frequency,
          (d) => d.letter
        )
      ) // descending frequency

      //   .domain(data.map((d) => d.letter))
      .range([marginLeft, width - marginRight])
      .padding(0.1);

    // Declare the y (vertical position) scale.
    const y = d3
      .scaleLinear()
      //@ts-ignore
      .domain([0, d3.max(data, (d) => d.frequency)])
      //   .domain([0, 0.1])
      .range([height - marginBottom, marginTop]);

    const svg = d3
      .select(barHolder)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    //* Add the x-axis (description for the x).
    svg
      .append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x));

    //* Add the y-axis (description for the y).
    svg
      .append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y));

    // Add a rect for each bar.
    svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("fill", "steelblue")
      // @ts-ignore
      .attr("x", (d) => x(d.letter))
      .attr("y", (d) => y(d.frequency))
      .attr("height", (d) => y(0) - y(d.frequency))
      .attr("width", x.bandwidth());

    //@ts-ignore
    d3.selectAll("rect").on("click", (event, d) => console.log(d.letter));

    //* old
    // svg
    //   .selectAll("rect")
    //   .data(data)
    //   .enter()
    //   .append("rect")

    //   .attr(
    //     "x",
    //     (d, i) =>
    //       i * ((width - data.length * barWidth) / data.length) + marginLeft
    //   )

    //   //   .attr("y", (d, i) => 300 - 10 * d)

    //   .attr("width", barWidth)
    //   .attr("height", 300)
    //   //   .attr("height", (d, i) => (d.frequency / 0.1) * 100 * (height / 100))

    //   .attr("fill", "green");
  }, []);

  return (
    <div>
      <p>BarChar</p>
      <div ref={barHolderRef} />
    </div>
  );
}
