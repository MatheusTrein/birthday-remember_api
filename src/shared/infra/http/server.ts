import { app } from "./app";

const port = process.env.API_PORT;

app.listen(Number(port), () => {
  console.log(`Server is running on port ${port}`);
});
