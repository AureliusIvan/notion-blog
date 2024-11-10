import { API_ENDPOINT, NOTION_TOKEN } from './server-constants'

export default async function rpc(fnName: string, body: any) {
  if (!NOTION_TOKEN) {
    throw new Error('NOTION_TOKEN is not set in env')
  }
  const res = await fetch(`${API_ENDPOINT}/${fnName}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie: `token_v2=${NOTION_TOKEN}`,
    },
    body: JSON.stringify(body),
  })

  if (res.ok) {
    return res.json()
  } else {
    throw new Error(await getError(res))
  }
}

export async function getError(res: Response) {
  return `Notion API error (${res.status}) \n${getJSONHeaders(
    res
  )}\n ${await getBodyOrNull(res)}`
}

// export function getJSONHeaders(res: Response) {
//   if (typeof res.headers.raw === 'function') {
//     // Use raw() if available
//     return JSON.stringify(res.headers.raw());
//   } else {
//     // Fallback: Manually construct headers as an object
//     const headersObj: Record<string, string[]> = {};
//     res.headers.forEach((value, key) => {
//       headersObj[key] = headersObj[key] ? [...headersObj[key], value] : [value];
//     });
//     return JSON.stringify(headersObj);
//   }
// }

export function getJSONHeaders(res: Response): string {
  // Convert headers to a plain object
  const headersObj: Record<string, string[]> = {};
  res.headers.forEach((value, key) => {
    headersObj[key] = headersObj[key] ? [...headersObj[key], value] : [value];
  });
  return JSON.stringify(headersObj);
}



export function getBodyOrNull(res: Response) {
  try {
    return res.text()
  } catch (err) {
    return null
  }
}

export function values(obj: any) {
  const vals: any = []

  Object.keys(obj).forEach(key => {
    vals.push(obj[key])
  })
  return vals
}
