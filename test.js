const checkRepo = require('.')
const timeout = 30 * 1000

it('works', async () => {
  await checkRepo('zeke/dimensions')
}, timeout)