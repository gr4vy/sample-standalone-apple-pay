import { Client } from "@gr4vy/node"
import fs from "fs"

const key = String(fs.readFileSync("./private_key.pem"))

const client = new Client({
  gr4vyId: "spider",
  privateKey: key,
  environment:"sandbox"
});

// Create an Embed token for use in the frontend
export default async (request, response) => {
  const { amount, currency }  = request.query
  const token = await client.getEmbedToken({
    amount: amount*100,
    currency: currency,
  })

  response.status(200).json({ token })
}
