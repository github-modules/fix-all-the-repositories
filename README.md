# fix-all-the-repositories

Automatically open pull requests to fix repos that have an ugly repository value in their package.json file

## Installation

This is a [Node.js](https://nodejs.org/) module available through the 
[npm registry](https://www.npmjs.com/). It can be installed using the 
[`npm`](https://docs.npmjs.com/getting-started/installing-npm-packages-locally)
or 
[`yarn`](https://yarnpkg.com/en/)
command line tools.

```sh
npm install fix-all-the-repositories --save
```

## Tests

```sh
npm install
npm test
```

## Dependencies

- [get-repo-package-json](https://ghub.io/get-repo-package-json): Fetch a GitHub repository&#39;s package.json file using the GitHub API
- [github-url-to-object](https://ghub.io/github-url-to-object): Extract user, repo, and other interesting properties from GitHub URLs

## Dev Dependencies

- [@octokit/rest](https://ghub.io/@octokit/rest): GitHub REST API client for Node.js
- [bottleneck](https://ghub.io/bottleneck): Distributed task scheduler and rate limiter
- [dotenv-safe](https://ghub.io/dotenv-safe): Load environment variables from .env and ensure they are defined
- [jest](https://ghub.io/jest): Delightful JavaScript Testing.

## License

MIT
