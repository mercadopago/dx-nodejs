/* istanbul ignore next */
module.exports = {
  additionalProperties: false, // Fails if an extra param is added to the model
  properties: {    
    id: {
      type: 'string'
    },
    plan_id: {
      type: 'string'
    },
    payer: {
      type: 'object',
      properties: {
        id: {
          type: 'string'
        },
        type: {
          enum: ['customer', 'registered']
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
      enum: ['authorized', 'paused', 'finished', 'cancelled']
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
    start_date: {
      type: 'string',
      pattern: '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}-[0-9]{2}:[0-9]{2}$'
    },
    end_date: {
      type: 'string',
      pattern: '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}-[0-9]{2}:[0-9]{2}$'
    },    
    metadata: {
      type: 'object'
    },  
    charges_detail: {
      type: 'object',
      properties: {
        invoices:  {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              period: {
                type: 'string',
                pattern: '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}-[0-9]{2}:[0-9]{2}$'
              },
              id: {
                type: 'string'
              }
            }
          }
        },
        last_charged_date: {
          type: 'string',
          pattern: '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}-[0-9]{2}:[0-9]{2}$'
        },
        last_charged_amount: {
          type: 'number'
        },
        pending_charge_amount: {
          type: 'number'
        },
        pending_charge_periods: {
          type: 'integer'
        },
        charged_amount: {
          type: 'number'
        },
        debt_periods: {
          type: 'integer'
        },
        next_payment_date: {
          type: 'string',
          pattern: '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}-[0-9]{2}:[0-9]{2}$'
        }
      }
    },
    setup_fee: {
      type: 'number'
    }
  }
};
