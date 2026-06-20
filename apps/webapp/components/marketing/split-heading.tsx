"use client";

import clsx from "clsx";
import { useEffect, useRef } from "react";
import SplitType from "split-type";

type SplitHeadingProps = React.ComponentPropsWithoutRef<"h2"> & {
  text: string;
};

export function SplitHeading({ text, className, ...props }: SplitHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let split = new SplitType(element, { types: "lines", tagName: "span" });

    let timeoutId: ReturnType<typeof setTimeout>;
    const resplit = () => {
      split.revert();
      split = new SplitType(element, { types: "lines", tagName: "span" });
    };

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(resplit, 100);
    };

    window.addEventListener("resize", handleResize);
    document.fonts?.ready.then(resplit);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
      split.revert();
    };
  }, [text]);

  return (
    <h2 ref={ref} className={clsx("split-heading", className)} {...props}>
      {text}
    </h2>
  );
}
