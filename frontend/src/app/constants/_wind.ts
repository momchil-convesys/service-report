export interface WindDirection {
  direction: string;
  code: string;
  degree: number;
  degreeRange: [number, number];
}

export interface WindDirection8 {
  direction: string;
  code: string;
  degree: number;
  degreeRange?: [number, number];
}

// 16 Wind Directions
export const WIND_DIRECTIONS_16: WindDirection[] = [
  { direction: 'North', code: 'N', degree: 0, degreeRange: [348.75, 11.25] },
  { direction: 'North-Northeast', code: 'NNE', degree: 22.5, degreeRange: [11.25, 33.75] },
  { direction: 'Northeast', code: 'NE', degree: 45, degreeRange: [33.75, 56.25] },
  { direction: 'East-Northeast', code: 'ENE', degree: 67.5, degreeRange: [56.25, 78.75] },
  { direction: 'East', code: 'E', degree: 90, degreeRange: [78.75, 101.25] },
  { direction: 'East-Southeast', code: 'ESE', degree: 112.5, degreeRange: [101.25, 123.75] },
  { direction: 'Southeast', code: 'SE', degree: 135, degreeRange: [123.75, 146.25] },
  { direction: 'South-Southeast', code: 'SSE', degree: 157.5, degreeRange: [146.25, 168.75] },
  { direction: 'South', code: 'S', degree: 180, degreeRange: [168.75, 191.25] },
  { direction: 'South-Southwest', code: 'SSW', degree: 202.5, degreeRange: [191.25, 213.75] },
  { direction: 'Southwest', code: 'SW', degree: 225, degreeRange: [213.75, 236.25] },
  { direction: 'West-Southwest', code: 'WSW', degree: 247.5, degreeRange: [236.25, 258.75] },
  { direction: 'West', code: 'W', degree: 270, degreeRange: [258.75, 281.25] },
  { direction: 'West-Northwest', code: 'WNW', degree: 292.5, degreeRange: [281.25, 303.75] },
  { direction: 'Northwest', code: 'NW', degree: 315, degreeRange: [303.75, 326.25] },
  { direction: 'North-Northwest', code: 'NNW', degree: 337.5, degreeRange: [326.25, 348.75] },
];

// 8 Wind Directions
export const WIND_DIRECTIONS_8: WindDirection8[] = [
  { direction: 'North', code: 'N', degree: 0, degreeRange: [337.5, 22.25] },
  { direction: 'Northeast', code: 'NE', degree: 45, degreeRange: [22.25, 67.5] },
  { direction: 'East', code: 'E', degree: 90, degreeRange: [67.5, 112.5] },
  { direction: 'Southeast', code: 'SE', degree: 135, degreeRange: [112.5, 157.5] },
  { direction: 'South', code: 'S', degree: 180, degreeRange: [157.5, 202.5] },
  { direction: 'Southwest', code: 'SW', degree: 225, degreeRange: [202.5, 247.5] },
  { direction: 'West', code: 'W', degree: 270, degreeRange: [247.5, 292.5] },
  { direction: 'Northwest', code: 'NW', degree: 315, degreeRange: [292.5, 337.5] },
];

// Helper function to get wind direction from degree (16 directions)
export function getWindDirectionFromDegree16(degree: number): WindDirection | undefined {
  // Normalize 360 degrees to 0 degrees
  if (degree === 360) {
    degree = 0;
  }

  // Handle the special case for North (0 degrees)
  if (degree >= 348.75 || degree <= 11.25) {
    return WIND_DIRECTIONS_16[0]; // North
  }

  // Find the wind direction based on degree range
  return WIND_DIRECTIONS_16.find((wind) => {
    const [min, max] = wind.degreeRange;
    return degree >= min && degree <= max;
  });
}

// Helper function to get wind direction from degree (8 directions)
export function getWindDirectionFromDegree8(degree: number): WindDirection8 | undefined {
  // Normalize 360 degrees to 0 degrees
  if (degree === 360) {
    degree = 0;
  }

  // Handle the special case for North (0 degrees)
  if (degree >= 337.5 || degree <= 22.25) {
    return WIND_DIRECTIONS_8[0]; // North
  }

  // Find the wind direction based on degree range
  return WIND_DIRECTIONS_8.find((wind) => {
    if (!wind.degreeRange) return false;
    const [min, max] = wind.degreeRange;
    return degree >= min && degree <= max;
  });
}
