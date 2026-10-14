export const PAGE_SIZE = 10;

const API_URL = 'https://dummyjson.com/posts';

export interface Post {
  id: number;
  title: string;
  body: string;
  tags: string[];
}

export interface PostsPage {
  posts: Post[];
  total: number;
  skip: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isPost(value: unknown): value is Post {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    typeof value.title === 'string' &&
    typeof value.body === 'string' &&
    Array.isArray(value.tags) &&
    value.tags.every((tag) => typeof tag === 'string')
  );
}

export function isPostsPage(value: unknown): value is PostsPage {
  return (
    isRecord(value) &&
    Array.isArray(value.posts) &&
    value.posts.every(isPost) &&
    typeof value.total === 'number' &&
    typeof value.skip === 'number'
  );
}

async function getJson(url: string, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
}

export async function fetchPostsPage(skip: number, signal: AbortSignal): Promise<PostsPage> {
  const data = await getJson(`${API_URL}?limit=${PAGE_SIZE}&skip=${skip}`, signal);
  if (!isPostsPage(data)) {
    throw new Error('Unexpected posts response');
  }
  return data;
}

export async function fetchPost(id: number, signal: AbortSignal): Promise<Post> {
  const data = await getJson(`${API_URL}/${id}`, signal);
  if (!isPost(data)) {
    throw new Error('Unexpected post response');
  }
  return data;
}
