import { Text } from "recharts";
import { useFormLabel } from "@/features/forms/hooks/useFormLabel";
import { Form } from "@/features/forms/schemas/forms";
import { memo } from "react";
import { TickProps } from "../types";


export const FormTicks = memo(({ x, y, payload }: TickProps) => {
  const label = useFormLabel(payload.value as Form);

  return (
    <Text
      x={x} y={y}
      textAnchor="middle"
      fontSize={14}
      lineHeight={18}
      verticalAnchor="middle"
      className="wrap leading-loose"
      width={50}
    >
      {label}
    </Text>
  );
})
