type CenteredLayoutProps = {
  children?: React.ReactNode;
};

const CenteredLayout = ({ children }: CenteredLayoutProps) => {
  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      {children}
    </div>
  );
};

export default CenteredLayout;
