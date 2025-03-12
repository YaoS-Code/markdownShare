import { createClient, WebDAVClient } from 'webdav';

// 增强日志记录的WebDAV客户端配置
export const createWebDAVClient = (url: string, username?: string, password?: string) => {
  console.log(`Creating WebDAV client for URL: ${url ? url.substring(0, url.indexOf(':', 8) > 0 ? url.indexOf(':', 8) : url.length) : 'undefined'}`);
  
  if (!url) {
    console.error('WebDAV URL is empty or undefined');
    throw new Error('WebDAV URL is required');
  }
  
  return createClient(url, {
    username,
    password
  });
};

export const getDirectoryContents = async (client: WebDAVClient, path: string) => {
  try {
    console.log(`Getting directory contents for: "${path}"`);
    const contents = await client.getDirectoryContents(path);
    console.log(`Successfully fetched directory contents for: "${path}", found ${Array.isArray(contents) ? contents.length : 0} items`);
    return contents;
  } catch (error) {
    console.error('Error fetching directory contents:', error);
    console.error('Path that failed:', path);
    throw error;
  }
};

export const getFileContents = async (client: WebDAVClient, path: string) => {
  try {
    console.log(`Getting file contents for: "${path}"`);
    // Try to normalize the path if it contains non-ASCII characters
    const content = await client.getFileContents(path, { format: 'text' });
    console.log(`Successfully fetched file contents for: "${path}"`);
    return content;
  } catch (error) {
    console.error('Error fetching file contents:', error);
    console.error('Path that failed:', path);
    
    // If the original path fails, try URI encoded version as fallback
    try {
      const encodedSegments = path.split('/').map(segment => 
        segment ? encodeURIComponent(segment) : ''
      );
      const encodedPath = encodedSegments.join('/');
      
      console.log(`Retrying with encoded path: "${encodedPath}"`);
      const content = await client.getFileContents(encodedPath, { format: 'text' });
      console.log(`Successfully fetched file contents with encoded path: "${encodedPath}"`);
      return content;
    } catch (retryError) {
      console.error('Error fetching file with encoded path:', retryError);
      throw error; // Throw the original error
    }
  }
}; 