
interface UnitCellProps {
  value: PropertyKey
  unit: string
}

export const UnitCell = ({ value, unit }: UnitCellProps) => {
  return (
    <div className="flex items-center">
      <span className="font-semibold">
        {String(value)}&nbsp;
        <span className="font-normal text-muted-foreground/75 text-[0.74rem]">{unit}</span>
      </span>
    </div>
  );
}
