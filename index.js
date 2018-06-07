require('dotenv-safe').load()

const getPackageJSON = require('get-repo-package-json')
const parseGitHubUrl = require('github-url-to-object')
const octokit = require('@octokit/rest')()
octokit.authenticate({type: 'token', token: process.env.GH_TOKEN})
const forkOrg = 'reporoomba'

module.exports = async function fixRepoPackage (repoName) {
  let error
  const pkg = await getPackageJSON(repoName).catch(err => { error = err })
  if (error) return {repoName, status: 'package.json not found', error}

  if (!repoNeedsFixing(pkg)) return {repoName, status: 'package.json already good'}

  const [owner, repo] = repoName.split('/')

  console.log('owner', owner)
  console.log('repo', repo)
  
  await octokit.repos.fork({owner, repo, organization: forkOrg})
    .catch(err => { error = err })

  if (error) return {repoName, status: 'unable to fork', error}

  // fix the repository property
  pkg.repository = parseGitHubUrl(pkg.repository.url).https_url

  // emulate probot convenience function
  const context = {
    repo: (obj) => { 
      const result = Object.assign({}, {owner: forkOrg, repo}, obj) 
      console.log(result)
      return result
    }
  }

  // Ref to use later for the branch
  const ref = 'update-repo-in-package-json'

  // Get the current "master" reference, to get the current master's sha
  const sha = await octokit.gitdata.getReference(context.repo({
    ref: 'heads/master'
  }))

  // Get the tree associated with master
  const tree = await octokit.gitdata.getTree(
    context.repo({tree_sha: sha.data.object.sha})
  )

  // Create a new blob
  const blob = await octokit.gitdata.createBlob(context.repo({
    content: JSON.stringify(pkg, null, 2)
  }))

  const newTree = await octokit.gitdata.createTree(context.repo({
    tree: [{
      path: 'package.json',
      sha: blob.data.sha,
      mode: '100644',
      type: 'blob'
    }],
    base_tree: tree.data.sha
  }))

  // Create a commit and a reference using the new tree
  const newCommit = await octokit.gitdata.createCommit(context.repo({
    message: `fix: use a URL string for repository in package.json`,
    parents: [sha.data.object.sha],
    tree: newTree.data.sha
  }))

  await octokit.gitdata.createReference(context.repo({
    ref: `refs/heads/${ref}`,
    sha: newCommit.data.sha
  }))

  const createdPR = await octokit.pullRequests.create(context.repo({
    owner: owner,
    title: `Use a URL string for repository in package.json`,
    body: 'This updates the `repository` value in package.json to be a string instead of an object',
    // For cross-repository pull requests in the same network, namespace head with a user like this: username:branch.
    head: `${forkOrg}:${ref}`,
    base: 'master'
  }))

  console.log(pkg)
}

function repoNeedsFixing (pkg) {
  return pkg && 
    pkg.repository && 
    pkg.repository.url && 
    parseGitHubUrl(pkg.repository.url)
}