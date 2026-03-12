import { MOCK_SERVER_PORT, createMockServer } from "./mock-server";

const server = createMockServer();
server.listen(MOCK_SERVER_PORT, () => {
  console.log(`mock-server running on :${MOCK_SERVER_PORT}`);
});
