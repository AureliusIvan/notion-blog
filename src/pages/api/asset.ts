import {NextApiRequest, NextApiResponse} from 'next';
import getNotionAssetUrls from '../../lib/notion/getNotionAssetUrls';
import {handleData, handleError, setHeaders} from '@lib/notion/utils';

interface QueryParams {
  assetUrl?: string;
  blockId?: string;
}

export default async function notionApi(
    req: NextApiRequest,
    res: NextApiResponse
) {
  // Set CORS or other headers and return early if setHeaders indicates no further action
  if (setHeaders(req, res)) return;

  try {
    const {assetUrl, blockId} = req.query as QueryParams;

    // Validate required parameters
    if (!assetUrl || !blockId) {
      return handleData(res, {
        status: 'error',
        message: 'Missing required parameters: assetUrl or blockId',
      });
    }

    // Retrieve signed URLs for the Notion asset
    const {signedUrls = [], ...urlsResponse} = await getNotionAssetUrls(
        res,
        assetUrl,
        blockId
    );

    if (signedUrls.length === 0) {
      console.error('Failed to retrieve signed URLs:', urlsResponse);
      return handleData(res, {
        status: 'error',
        message: 'Failed to retrieve asset URL',
      });
    }

    // Redirect to the last signed URL in the array
    // @ts-ignore
    res.status(307).setHeader('Location', signedUrls.pop());
    res.end();
  } catch (error) {
    // Handle any unexpected errors
    // @ts-ignore
    handleError(res, error);
  }
}
