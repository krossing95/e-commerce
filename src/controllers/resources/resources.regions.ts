import { Request, Response } from "express"
import { Regions } from "../../lib/static/static.index"

const FetchRegions = (req: Request, res: Response) => {
  const q = req.query?.q as string | undefined
  let regionsData = Regions

  if (q) {
    const keyword = q.toLowerCase()
    regionsData = regionsData.filter((data) =>
      JSON.stringify(data).toLowerCase().includes(keyword)
    )
  }

  return res
    .status(200)
    .json({ message: "", code: "200", data: { regions: regionsData } })
}
export default FetchRegions
