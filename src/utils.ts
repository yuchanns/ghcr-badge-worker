export const makeAuthToken = (owner: string, repo: string) => btoa(`v1:${owner}/${repo}:0`)

export const makeHeaders = (config: GHCRConfig) => {
  const headers = new Headers();
  headers.set('Authorization', `Bearer ${makeAuthToken(config.owner, config.repo)}`);
  headers.set('User-Agent', config.userAgent || 'Docker-Client/20.10.2 (linux)');
  return headers;
}


