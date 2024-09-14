export const calculateHandValue = (handValues: readonly number[]) => {
  console.log("Input hand values:", handValues);
  let sum = 0;
  let aceCount = 0;
  
  for (const value of handValues) {
    if (value === 1) {
      aceCount++;
    } else if (value >= 10) {
      sum += 10;
    } else {
      sum += value;
    }
  }
  
  console.log("Initial sum:", sum, "Ace count:", aceCount);
  
  // Add Aces
  for (let i = 0; i < aceCount; i++) {
    if (sum + 11 <= 21) {
      sum += 11;
    } else {
      sum += 1;
    }
  }
  
  console.log("Final sum:", sum);
  return sum;
};

export default calculateHandValue;