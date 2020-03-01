// This function takes a level as input and generates a random number depending on difficulty
function randomiseLevelFromScore() {
  return BABYLON.Scalar.RandomRange(1, 4);
}

// This function returns an array of spike indices from a level between 1 - 5
export function generateSpikeIndicesFromLevel(currentScore: number) {
  let temp_indices = [];
  let rand_num = randomiseLevelFromScore(); // Randomise level range from score

  // Randomise indices
  for (let i = 0; i < rand_num; i++)
    temp_indices[i] = Math.floor(Math.random() * 5);

  // Make unique
  let unique = new Set(temp_indices);
  let final = Array.from(unique);

  return final; // Return array
}
