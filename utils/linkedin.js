const LINKEDIN_API_URL = 'https://api.linkedin.com/v2';
const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2';

export const getAuthUrl = state => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.LINKEDIN_CLIENT_ID,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/linkedin/callback`,
    state,
    scope: 'openid profile email w_member_social',
  });

  return `${LINKEDIN_AUTH_URL}/authorization?${params.toString()}`;
};

export async function getAccessToken(code) {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/linkedin/callback`,
    client_id: process.env.LINKEDIN_CLIENT_ID,
    client_secret: process.env.LINKEDIN_CLIENT_SECRET,
  });

  const response = await fetch(`${LINKEDIN_AUTH_URL}/accessToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to get access token');
  }

  return response.json();
}

export async function getUserInfo(accessToken) {
  const response = await fetch(`${LINKEDIN_API_URL}/userinfo`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get user info');
  }

  return response.json();
}

export async function refreshAccessToken(refreshToken) {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: process.env.LINKEDIN_CLIENT_ID,
    client_secret: process.env.LINKEDIN_CLIENT_SECRET,
  });

  const response = await fetch(`${LINKEDIN_AUTH_URL}/accessToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  return response.json();
}

async function uploadImageAsset(accessToken, imageBuffer, imageType) {
  try {
    // Register upload
    const registerUploadResponse = await fetch(`${LINKEDIN_API_URL}/assets?action=registerUpload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: 'urn:li:person:' + (await getUserInfo(accessToken)).sub,
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent',
            },
          ],
        },
      }),
    });

    if (!registerUploadResponse.ok) {
      throw new Error('Failed to register image upload');
    }

    const {
      value: { uploadMechanism, asset },
    } = await registerUploadResponse.json();
    const { uploadUrl } =
      uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'];

    // Upload the image
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': imageType,
      },
      body: imageBuffer,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload image');
    }

    return asset;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function createPost(accessToken, content, imageBuffer = null, imageType = null) {
  try {
    // First get profile info from OIDC endpoint to get sub (which is the Person URN)
    const userInfo = await getUserInfo(accessToken);
    const authorUrn = userInfo.sub;

    // Upload image if provided
    let imageAsset = null;
    if (imageBuffer && imageType) {
      imageAsset = await uploadImageAsset(accessToken, imageBuffer, imageType);
    }

    // Create post using UGC Posts API
    const postResponse = await fetch(`${LINKEDIN_API_URL}/ugcPosts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        author: `urn:li:person:${authorUrn}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content,
            },
            shareMediaCategory: imageAsset ? 'IMAGE' : 'NONE',
            ...(imageAsset && {
              media: [
                {
                  status: 'READY',
                  description: {
                    text: 'Image shared with post',
                  },
                  media: imageAsset,
                },
              ],
            }),
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      }),
    });

    if (!postResponse.ok) {
      const errorData = await postResponse.json();
      throw new Error(errorData.message || 'Failed to create post');
    }

    // Get the post ID from the response header
    const postId = postResponse.headers.get('x-restli-id');
    return { success: true, postId };
  } catch (error) {
    console.error('Error creating LinkedIn post:', error);
    throw new Error(`Failed to create post: ${error.message}`);
  }
}
