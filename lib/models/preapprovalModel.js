/* istanbul ignore next */
module.exports = {
  additionalProperties: true,
  properties: {
    payer_email: {
      type: 'string',
      maxLength: 256
    },
    back_url: {
      type: 'string',
      maxLength: 256
    },
    status: {
      enum: ['pending', 'authorized', 'paused', 'cancelled']
    },
    auto_recurring: {
      type: 'object',
      properties: {
        frequency: {
          type: 'integer'
        },
        frequency_type: {
          enum: ['days', 'months']
        },
        transaction_amount: {
          type: 'number'
        },
        currency_id: {
          type: 'string',
          maxLength: 3
        },
        start_date: {
          type: 'string',
          pattern: '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}(\-|\+)[0-9]{2}:[0-9]{2}$'
        },
        end_date: {
          type: 'string',
          pattern: '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}(\-|\+)[0-9]{2}:[0-9]{2}$'
        }
      }
    },
    reason: {
      type: 'string',
      maxLength: 256
    },
    external_reference: {
      type: 'string',
      maxLength: 256
    }
  }
};
