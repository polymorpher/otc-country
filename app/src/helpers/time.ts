export const formatSeconds = (seconds: number) => {
  const min = Math.floor((seconds % 3600) / 60);
  const hour = Math.floor(seconds / 3600);
  const sec = seconds % 60;

  return [
    [hour, 'hour'],
    [min, 'minute'],
    [sec, 'second'],
  ]
    .filter(([val]) => val > 0)
    .map(([val, unit]) => `${val} ${unit}`.concat(val > 1 ? 's' : ''))
    .join(' ');
};
