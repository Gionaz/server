const mockUser = {
  email: "ombaticomori@gmail.com",
  password: "newpassword",
  fullName: "Ombati Omori",
  userName: "Ombati",
  _id: "64423249dd4c144e73c5392e",
  code: 2090,
  device: "mobile",
  pageNumber: 1,
};
const mockFeed = {
  portfolioId: "64a40ba9373d7253dc1f59f2",
  createdBy: "64a40ba7373d7253dc1f571d",
  searchValue: "nature",
  postId: "",
  imageUrl: "",
};
module.exports = [
  /*
  {
    endPoint: "POST /register",
    desc: "Should register a user and send email verification code",
    mockData: {
      ...mockUser,
      module: "Users",
      action: "Register",
    },
    check: ["user"],
  },
  {
    endPoint: "POST /codeVerification",
    desc: "Should verify code if the verification code is correct",
    mockData: {
      ...mockUser,
      module: "Users",
      action: "codeVerification",
      userToVerify: mockUser,
    },
    check: ["status"],
  },
  {
    endPoint: "POST /login",
    desc: "Should login the user and return a JWT and refresh token",
    mockData: {
      ...mockUser,
      module: "Users",
      action: "Login",
    },
    check: ["User"],
  },
  {
    endPoint: "POST /fgPass",
    desc: "Should generate a password reset verification code and send it through email",
    mockData: {
      ...mockUser,
      module: "Users",
      action: "fgPass",
    },
    check: ["status", "verification", "verificationType"],
  },
  {
    endPoint: "POST /resendCode",
    desc: "Should resend verfification code",
    mockUser: {
      ...mockUser,
      module: "Users",
      action: "resendCode",
    },
    check: ["status"],
  },
  {
    endPoint: "POST /Reset Password",
    desc: "Should reset password if valid activation code is found",
    mockData: {
      ...mockUser,
      module: "Users",
      action: "Reset Password",
      user: mockUser,
    },
    check: ["status"],
  },

  {
    endPoint: "POST /updateUser",
    desc: "Should update user information/profile",
    mockData: {
      ...mockUser,
      module: "Users",
      action: "updateUser",
      userId: mockUser._id,
    },
    check: ["status"],
  },

  {
    endPoint: "POST /getSocialFeeds",
    desc: "Should fetch portfolios/socialfeeds",
    mockData: {
      ...mockUser,
      module: "Portfolios",
      action: "getSocialsFeeds",
      userId: mockUser._id,
    },
    check: ["status"],
  },
  {
    endPoint: "POST /likeDislike",
    desc: "Should like or unlike a socialfeeds",
    mockData: {
      ...mockUser,
      module: "Portfolios",
      action: "likeDislike",
      feedId: mockFeed.portfolioId,
      createdBy: mockFeed.createdBy,
    },
    check: ["status"],
  },

  {
    endPoint: "POST /deletePortfolio",
    desc: "Should delete a portfolio",
    mockData: {
      module: "Portfolios",
      action: "deletePortfolio",
      portfolioId: mockFeed.portfolioId,
    },
    check: ["status"],
  },

  {
    endPoint: "POST /getPortfolio",
    desc: "Should fetch a portfolio",
    mockData: {
      module: "Portfolios",
      action: "getPortfolio",
      portfolioId: mockFeed.portfolioId,
    },
    check: ["status"],
  },

  {
    endPoint: "POST /getPortfolios",
    desc: "Should fetch portfolios",
    mockData: {
      module: "Portfolios",
      action: "getPortFolios",
      searchValue: mockFeed.searchValue,
    },
    check: [],
  },
  */
  {
    endPoint: "POST /reportInappropriate",
    desc: "Should report inappropriate post",
    mockData: {
      module: "Portfolios",
      action: "reportInappropriate",
      imageUrl: mockFeed.imageUrl,
      postId: mockFeed.postId,
    },
    check: ["status"],
  },
];
