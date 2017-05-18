const {send, json} = require('micro')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

/**
 * A payment handler class
 *
 * @type {StripePaymentHandler}
 */
module.exports = class StripePaymentHandler {
  /**
   * Create the handler object
   *
   * @param  {object} request
   * @param  {object} response
   *
   * @return {self}
   */
  constructor(request, response) {
    this.request = request
    this.response = response
  }

  /**
   * Create a charge via the Stripe API
   */
  charge() {
    // Decode the JSON request data
    json(this.request)
      .then(data => {
        // Create the charge
        stripe.charges.create(data, error => {
          if (error) {
            return send(this.response, 400, {
              error: this.error(error)
            })
          }

          return send(this.response, 200, {
            message: 'Payment Successful'
          })
        })
      })
  }

  /**
   * Translate the stripe error message into something
   * that we can display to users
   *
   * @param  {object} error
   *
   * @return {string}
   */
  error(error) {
    switch (error.type) {
      case 'StripeCardError': {
        // A declined card error
        // => e.g. "Your card's expiration year is invalid."
        return error.message
      }

      default: {
        // Handle any other types of unexpected errors
        return 'Sorry, an error occurred. Please try again.'
      }
    }
  }
}
