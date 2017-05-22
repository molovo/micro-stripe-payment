import micro from 'micro'
import test from 'ava'
import listen from 'test-listen'
import request from 'request-promise'
import {StatusCodeError} from 'request-promise-core/errors'
import handler from './index'

// Bootstrap the service
const service = micro(handler)

/**
 * Test that a GET request prints a status message,
 * without doing any payment processing
 *
 * @param  {Test} t
 */
test('GET request returns status message', async t => {
  const url = await listen(service)
  const body = await request(url)

  t.deepEqual(JSON.parse(body).message, 'The Stripe charge server is up and running!')
})

/**
 * Test that a HEAD request returns no body,
 * without doing any payment processing
 *
 * @param  {Test} t
 */
test('HEAD request returns no body', async t => {
  const url = await listen(service)
  const response = await request({
    uri: url,
    method: 'HEAD',
    json: true,
    resolveWithFullResponse: true
  })

  t.is(response.statusCode, 204)
  t.is(typeof response.body, 'undefined')
})

/**
 * Test that a OPTIONS request returns an empty object,
 * without doing any payment processing
 *
 * @param  {Test} t
 */
test('OPTIONS request returns empty object', async t => {
  const url = await listen(service)
  const body = await request({
    uri: url,
    method: 'OPTIONS',
    json: true
  })

  t.deepEqual(body, {})
})

/**
 * Test that a POST request without any request data returns a 400 error,
 * without doing any payment processing
 *
 * @param  {Test} t
 */
test('POST request with no data returns 400', async t => {
  const url = await listen(service)
  const error = await t.throws(request({
    uri: url,
    method: 'POST',
    body: {},
    json: true
  }), StatusCodeError)

  t.is(error.message, '400 - {"error":"Sorry, an error occurred. Please try again."}')
})

/**
 * Test that a request on a disallowed method returns a 405 error,
 * without doing any payment processing
 *
 * @param  {Test} t
 */
test('Disallowed methods return 405', async t => {
  const url = await listen(service)
  const error = await t.throws(request({
    uri: url,
    method: 'PUT',
    body: {},
    json: true
  }), StatusCodeError)

  t.is(error.message, '405 - {"error":"Method Not Allowed"}')
})

/**
 * Test that a request containing valid card details
 * processes a payment successfully
 *
 * @param  {Test} t
 */
test('POST request with valid card creates a charge', async t => {
  const url = await listen(service)
  const body = await request({
    uri: url,
    method: 'POST',
    body: {
      currency: 'gbp',
      amount: 1000,
      source: {
        exp_month: '03', // eslint-disable-line camelcase
        exp_year: '2021', // eslint-disable-line camelcase
        number: '4242424242424242',
        object: 'card',
        cvc: '123'
      }
    },
    json: true
  })

  t.is(body.message, 'Payment Successful')
})

/**
 * Test that a request containing invalid card details returns a 400 error
 * without processing the payment
 *
 * @param  {Test} t
 */
test('POST request with invalid card fails', async t => {
  const url = await listen(service)
  const error = await t.throws(request({
    uri: url,
    method: 'POST',
    body: {
      currency: 'gbp',
      amount: 1000,
      source: {
        exp_month: '03', // eslint-disable-line camelcase
        exp_year: '2021', // eslint-disable-line camelcase
        number: '1111111111111111',
        object: 'card',
        cvc: '123'
      }
    },
    json: true
  }), StatusCodeError)

  t.is(error.message, '400 - {"error":"Your card number is incorrect."}')
})
