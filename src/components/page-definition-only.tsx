/**
 * Page Definition Layout
 * ----------------
 * ONLY USE FOR INITIAL PAGE DEFINITIONS
 */

type CenteredLayoutProps = {
  children?: React.ReactNode;
  label?: string;
};

export const PageDefinitionOnly = ({
  children,
  label,
}: CenteredLayoutProps) => {
  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      {label && <h1 className="text-lg">This is the {label} page</h1>}
      {children && children}
    </div>
  );
};
