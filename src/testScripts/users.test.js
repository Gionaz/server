const { default: mongoose } = require("mongoose");
const request = require("supertest");
const axios = require("axios");
const testUrl = "http://192.168.100.26:3001/";
const tests = require("./testJson");
const mockUser = {
  email: process.env.testerEmail,
  password: process.env.testerPassword,
  fullName: process.env.testerFullName,
  userName: process.env.testerUserName,
  _id: process.env.testId,
};
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySW5mbyI6eyJyb2xlcyI6W119LCJpYXQiOjE2NzMwMDE3NTMsImV4cCI6MTY3Mzg2NTc1M30.j9cuYWin_2E0qzm4mNs4WHznnH468h8WpQs1ofNiBgE";

for (let index = 0; index < tests.length; index++) {
  const test = tests[index];
  describe(test.endPoint, () => {
    it(
      test.desc,
      async () => {
        const response = await axios.post(
          testUrl,
          JSON.stringify({ ...test.mockData, isTest: true }),
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: "Bearer ", // + jwtTokeny
            },
          }
        );
        expect(response.status).toEqual(201);
        test.check.forEach((c) => {
          expect(response.data).toHaveProperty(c);
        });
      },
      60000
    );
  });
}
