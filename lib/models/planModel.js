/* istanbul ignore next */
module.exports = {
  additionalProperties: false, // Fails if an extra param is added to the model
  properties: {    
    id: {
      type: 'string'
    },
    application_fee: {
      type: 'number'
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
    auto_recurring: {
      type: 'object',
      properties: {
        frequency: {
          type: 'integer'
        },
        frequency_type: {
          type: 'string'
        },
        transaction_amount: {
          type: 'number'
        },
        currency_id: {
          type: 'string'
        },
        repetitions: {
          type: 'integer'
        },
        debit_date: {
          type: 'integer'
        },
        free_trial: {
          type: 'object',
          properties: {
            frequency: {
              type: 'integer'
            },
            frequency_type: {
              type: 'string'
            }
          }
        },
      }
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
  }
};
