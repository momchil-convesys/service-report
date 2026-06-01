export const calcScheduleAdjustmentPercentage = (coefficient: number) =>
  coefficient ? Math.round((coefficient * 100 - 100) * 100) / 100 : undefined;

export const calcScheduleAdjustmentPercentageFormatted = (coefficient: number) => {
  const percentage = calcScheduleAdjustmentPercentage(coefficient);

  if (percentage === undefined || percentage === 0) {
    return '';
  }

  const sign = percentage > 0 ? '+' : '';
  return ` (${sign}${percentage}%)`;
};
