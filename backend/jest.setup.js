// Jest setup file
// The API integration suite starts the Express listener. Bind an ephemeral
// port so it cannot collide with a locally running development server.
process.env.PORT = '0';

beforeAll(async () => {
  // Global setup if needed
});

afterAll(async () => {
  // Cleanup
});
