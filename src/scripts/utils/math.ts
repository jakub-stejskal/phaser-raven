export function random(lowerBound: number, upperBound: number): number {
  // Ensure the bounds are integers
  lowerBound = Math.ceil(lowerBound)
  upperBound = Math.floor(upperBound)

  return Math.floor(Math.random() * (upperBound - lowerBound)) + lowerBound
}
