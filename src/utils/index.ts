let counter = 0;

export const generateUniqueId = () => {
  const timestamp = Date.now(); // Get the current timestamp in milliseconds
  counter = (counter + 1) % 1000; // Increment the counter and wrap it around at 1000
  return timestamp * 1000 + counter; // Combine the timestamp and counter to create a unique ID
};
