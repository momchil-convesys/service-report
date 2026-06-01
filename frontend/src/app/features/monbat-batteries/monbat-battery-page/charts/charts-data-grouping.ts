export const defaultDataGroupingApproximation = 'average';
// export const defaultDataGroupingApproximation = function (groupData: any) {
//   // If all are nulls return null
//   if (groupData.find((x: number | null) => x !== null) === undefined) {
//     return null;
//   }

//   const average =
//     groupData.reduce((a: number | null, b: number | null) => (a || 0) + (b || 0), 0) /
//     groupData.length;

//   const result = Math.round((average + Number.EPSILON) * 100) / 100;

//   return result;
// };

// function electricCurrentDataGroupingApproximation(groupData: any) {
//   // If all are nulls return null
//   if (groupData.find((x: number | null) => x !== null) === undefined) {
//     return null;
//   }

//   // If there is at least one point greater than electricCurrentIrrelevanceTreshold A or less than -electricCurrentIrrelevanceTreshold A
//   if (groupData.find((x: number | null) => Math.abs(x || 0) > electricCurrentIrrelevanceTreshold)) {
//     const average =
//       groupData.reduce((a: number | null, b: number | null) => (a || 0) + (b || 0), 0) /
//       groupData.length;

//     const result = Math.round((average + Number.EPSILON) * 100) / 100;

//     return result;
//   }

//   return 0;
// }
