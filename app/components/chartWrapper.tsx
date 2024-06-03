import React from "react";

interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function ChartWrapper({ title, description, children }: Props) {
  return (
    <div className="w-full flex flex-col mt-32">
      <div className="w-full flex flex-col">
        <h1 className="text-2xl font-extrabold text-center text-slate-700">
          {title}
        </h1>
        {description && <p>{description}</p>}
      </div>
      <div className="w-full flex justify-center">
        <div className="flex flex-col aspect-square w-[80vw]">{children}</div>
      </div>
    </div>
  );
}
