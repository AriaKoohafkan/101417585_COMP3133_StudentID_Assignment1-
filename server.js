const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const dotenv = require("dotenv");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const connectDB = require("./config/db");
const typeDefs = require("./schemas");
const resolvers = require("./resolvers");

dotenv.config(); 

const SECRET_KEY = process.env.JWT_SECRET || "qwerty14"; // JWT Secret Key
const PORT = process.env.PORT || 5000; // Server Port

const startServer = async () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  await connectDB(); // Connect to MongoDB

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const token = req.headers.authorization || "";
      if (token.startsWith("Bearer ")) {
        try {
          const decoded = jwt.verify(token.split(" ")[1], SECRET_KEY);
          return { user: decoded }; // Attach user info to context
        } catch (err) {
          console.error("Invalid token:", err);
        }
      }
      return {};
    },
  });

  await server.start();
  server.applyMiddleware({ app });

  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}/graphql`);
  });
};

startServer();
