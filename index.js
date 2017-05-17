require('dotenv').config()

const {send} = require('micro')
const StripePaymentHandler = require('./stripe-payment-handler')

/**
 * Create the request handler
 *
 * @param  {object} request
 * @param  {object} response
 *
 * @return {string|null}
 */
module.exports = async (request, response) => {
  // Set Headers
  response.setHeader('Access-Control-Request-Method', 'POST, GET')
  response.setHeader('Access-Control-Allow-Credentials', 'true')
  response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  response.setHeader('Access-Control-Allow-Origin', process.env.STRIPE_ALLOW_DOMAIN)

  // Get the request method from the request
  const {method} = request

  // Choose a response based on the request method
  switch (method) {
    // OPTIONS requests are used for access control
    case 'OPTIONS': {
      return {}
    }

    // For GET requests, print a simple status message
    case 'GET': {
      return {
        message: 'The Stripe charge server is up and running!',
        timestamp: new Date().toISOString()
      }
    }

    // For POST requests, handle the payment
    case 'POST': {
      const handler = new StripePaymentHandler(request, response)
      return handler.charge()
    }

    // All other methods not allowed
    default: {
      send(response, 405, {
        error: 'Method Not Allowed'
      })
    }
  }
}
