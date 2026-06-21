type CustomPlaceholderProps = {
  label: string;
  height?: "180vh" | "80vh";
};

export const CustomPlaceholder = ({
  label,
  height = "180vh",
}: CustomPlaceholderProps) => {
  return (
    <section
      className="flex w-full items-center justify-center bg-neutral-100"
      style={{ minHeight: height }}
    >
      <p className="text-3xl font-semibold text-neutral-500 md:text-5xl">{label}</p>
    </section>
  );
};
