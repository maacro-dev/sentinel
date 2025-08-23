import { Text, useChartWidth } from "recharts";
import { useFormLabel } from "@/features/forms/hooks/useFormLabel";
import { Form } from "@/features/forms/schemas/forms";
import { memo } from "react";
import { TickProps } from "../types";
import { getResponsiveFontSize } from "./chartUtils";


export const FormTicks = memo(({ x, y, payload }: TickProps) => {
  const label = useFormLabel(payload.value as Form);
  const fontSize = getResponsiveFontSize({
    width: useChartWidth(),
    maxFont: 14,
    minFont: 6,
    startDecreaseWidth: 800
  })

  return (
    <Text
      x={x} y={y}
      textAnchor="middle"
      fontSize={fontSize}
      lineHeight={18}
      verticalAnchor="middle"
      className="wrap leading-loose"
      width={50}
    >
      {label}
    </Text>
  );
})
