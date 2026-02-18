
type ProgressCircleProps = {
  percentage: number;
  size?: number;
  strokeWidth?: number;
};

export default function ProgressCircle({
  percentage,
  size = 80,
  strokeWidth = 8,
}: ProgressCircleProps) {
  const cleanPercentage = Math.min(100, Math.max(0, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - cleanPercentage / 100);

  return (
    <div
      className="flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-emerald-600 transition-all duration-500"
          />
        </svg>

        <div className="absolute inset-0 grid place-items-center text-sm font-bold leading-none">
          {cleanPercentage}%
        </div>
      </div>
    </div>
  );
}
