import React from "react";
import { cn } from "../utils/style";

export type KVPair<Key = any, Value = any> = {
  key: Key;
  value: Value;
};

export interface KVListProps extends React.ComponentProps<"div"> {
  itemsPerColumn?: number;
}

export const KVList = ({ className, itemsPerColumn = 6, children, ...props }: KVListProps) => {
  const childArray = React.Children.toArray(children);

  const columns: React.ReactNode[][] = [];
  for (let i = 0; i < childArray.length; i += itemsPerColumn) {
    columns.push(childArray.slice(i, i + itemsPerColumn));
  }

  return (
    <div className={cn(`flex`, className)} {...props}>
      {columns.map((colItems, colIndex) => (
        <dl key={colIndex} className="flex flex-col gap-4 flex-1">
          {colItems}
        </dl>
      ))}
    </div>
  );
};

interface KVItemProps extends React.ComponentProps<"div"> {
  pair: KVPair<string, string>;
}

export const KVItem = (props: KVItemProps) => {
  return (
    <div className="flex flex-col gap-1.5 break-inside-avoid">
      <dt className="font-semibold text-xs text-muted-foreground/60">{props.pair.key}</dt>
      <dd className="text-xs text-foreground">{props.pair.value}</dd>
    </div>
  )
}
