function compareArrays<T extends string | number>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) return false;
  
  const set2 = new Set(arr2);
  return arr1.every(item => set2.has(item));
}