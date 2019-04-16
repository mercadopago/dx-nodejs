/* istanbul ignore next */
module.exports = {
  additionalProperties: true, // Fails if an extra param is added to the model
  properties: {    
    id: {
      type: 'string'
    },
    subscription_id: {
      type: 'string'
    },
    plan_id: {
      type: 'string'
    },
    payer: {
      type: 'object',
      properties: {      
        type: {
          enum: ['customer', 'registered', 'guest']
        },
        id: {
          type: 'string'
        },
        email: {
          type: 'string',
          format: 'email'
        },
        identification: {
          type: 'object',
          properties: {
            type: {
              type: 'string'
            },
            number: {
              type: 'string'
            }
          }
        }
      }
    },
    application_fee: {
      type: 'number'
    },
    status: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    external_reference: {
      type: 'string'
    },
    date_created: {
      type: 'string',
      pattern: '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}-[0-9]{2}:[0-9]{2}$'
    },
    last_modified: {
      type: 'string',
      pattern: '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}-[0-9]{2}:[0-9]{2}$'
    },
    live_mode: {
      type: 'boolean'
    },
    setup_fee: {
      type: 'number'
    },
    metadata: {
      type: 'object'
    },
    payments: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          attempt_date: {
            type: 'string',
            pattern: '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}-[0-9]{2}:[0-9]{2}$'
          },
          id: {
            type: 'string'
          },
          status: {
            type: 'string'
          },
          status_detail: {
            type: 'string'
          },
        }
      }
    },
    debit_date: {
      type: 'string',
      pattern: '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}-[0-9]{2}:[0-9]{2}$'
    }, 
    next_payment_date: {
      type: 'string',
      pattern: '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}-[0-9]{2}:[0-9]{2}$'
    },
  }
};
