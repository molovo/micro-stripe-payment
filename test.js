const micro = require('micro')
const test = require('ava')
const listen = require('test-listen')
const request = require('request-promise')
const service = micro(require('./index'))
const {StatusCodeError} = require('request-promise-core/errors')

test('GET request returns status message', async t => {
  const url = await listen(service)
  const body = await request(url)

  t.deepEqual(JSON.parse(body).message, 'The Stripe charge server is up and running!')
})

test('OPTIONS request returns empty object', async t => {
  const url = await listen(service)
  const body = await request({
    uri: url,
    method: 'OPTIONS'
  })

  t.deepEqual(JSON.parse(body), {})
})

test('POST request with no data returns 400', async t => {
  const url = await listen(service)
  const error = await t.throws(request({
    uri: url,
    method: 'POST',
    body: {},
    json: true
  }), StatusCodeError)

  t.is(error.message, '400 - {\"error\":\"Sorry, an error occurred. Please try again.\"}')

})
