import { cn } from "@/lib/utils";

type CenteredLayoutProps = {
  className?: string;
  children?: React.ReactNode;
};

export const CenteredLayout = ({ className, children }: CenteredLayoutProps) => {
  return (
    <div
      className={cn(
        "h-screen w-screen flex flex-col justify-center items-center",
        className
      )}
    >
      {children}
    </div>
  );
};

