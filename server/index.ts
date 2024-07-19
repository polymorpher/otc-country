import express, { Request, Response } from "express";
import dotenv from "dotenv";
import client from "./pg";

// configures dotenv to work in your application
dotenv.config();

const app = express();

const PORT = process.env.PORT;

app.get("/", async (request: Request, response: Response) => {
  const { asset, age } = request.query
  const page = Number(request.query.page ?? 0)
  const pageSize = Number(request.query.pageSize ?? 10)

  const where = ["TRUE"], args = []

  if (asset !== undefined) {
    where.push("(src_asset = $ OR dest_asset = $)")
    args.push(asset)
  }

  if (age !== undefined) {
    // age in hour
    where.push("time >= $")
    args.push(Date.now() / 1000 - Number(age) * 3600)
  }

  args.push(pageSize * page)
  args.push(pageSize)

  let cnt = 1

  const query = `
    SELECT *
    FROM logs
    WHERE ${where.join(" AND ")}
    OFFSET $
    LIMIT $
    ORDER BY id DESC
  `.replace(/\$/g, () => `$${cnt++}`);

  await client.connect()

  const res = await client.query(query, args)

  await client.end()

  response.status(200).send(res.rows);
}); 

app.listen(PORT, () => {
  console.log("Server running at PORT: ", PORT);
}).on("error", (error) => {
  // gracefully handle error
  throw new Error(error.message);
});
