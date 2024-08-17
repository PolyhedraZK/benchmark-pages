export const fetchRepos = async (repoOwner) => {
    const allRepos = [];
    let page = 1;
    let hasMore = true;
  
    while (hasMore) {
      const apiUrl = `https://api.github.com/users/${repoOwner}/repos?per_page=100&page=${page}`;
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Failed to fetch repositories');
      const data = await response.json();
      allRepos.push(...data);
      hasMore = data.length === 100;
      page++;
    }
  
    return allRepos.map(repo => ({
      value: repo.name,
      label: repo.name
    }));
  };
  
  export const fetchBranches = async (repoOwner, repoName) => {
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/branches`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Failed to fetch branches');
    const data = await response.json();
    return data;
  };
  
  export const fetchCommits = async (repoOwner, repoName, branch) => {
    const allCommits = [];
    let page = 1;
    let hasMore = true;
  
    while (hasMore) {
      const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/commits?sha=${branch}&per_page=100&page=${page}`;
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Failed to fetch commits');
      const data = await response.json();
      allCommits.push(...data);
      hasMore = data.length === 100;
      page++;
    }
  
    return allCommits.map(commit => ({
      value: commit.sha,
      label: `${commit.sha.substring(0, 7)} - ${commit.commit.message.split('\n')[0]}`
    }));
  };
  
  export const fetchBenchmarkData = async (repoOwner, repoName, commitHash) => {
    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/commits?sha=${commitHash}&per_page=30`);
    if (!response.ok) throw new Error('Failed to fetch commits');
    const commits = await response.json();
  
    const fetchPromises = commits.map(commit =>
      fetch(`https://storage.googleapis.com/github_micro_bench/${repoName}/benchmark_${commit.sha}.json`)
        .then(response => response.ok ? response.json() : null)
        .then(data => ({ commit: commit.sha, data }))
    );
  
    const results = await Promise.all(fetchPromises);
    return results.reduce((acc, { commit, data }) => {
      if (data) acc[commit] = data;
      return acc;
    }, {});
  };