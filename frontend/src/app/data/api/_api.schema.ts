export const schema = {
  openapi: '3.0.3',
  info: {
    version: '1.0.0',
    title: 'Convesys CMS API',
    description: 'Description...',
  },
  tags: [
    {
      name: 'devices',
      description: 'Provide data related to plants and devices.',
    },
    {
      name: 'metrics',
      description: 'A.k.a. Live Data — Provide current metric values for requested device(s).',
    },
    {
      name: 'faults',
      description: 'Provide sets of fault definitions for different devices.',
    },
    {
      name: 'error-stacks',
      description: 'Provide error stacks data.',
    },
  ],
  paths: {
    '/plants': {
      get: {
        tags: ['devices'],
        description: 'Retrieve all plants related to authenticated user.',
        responses: {
          '200': {
            description: 'Successful response.',
            content: {
              '*/*': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Plant',
                  },
                },
              },
            },
          },
        },
      },
      parameters: [
        {
          $ref: '#/components/parameters/embedDevices',
        },
      ],
    },
    '/plants/{plantId}': {
      get: {
        tags: ['devices'],
        description: 'Retrieve a single plant with provided ID.',
        responses: {
          '200': {
            description: 'Successful response.',
            content: {
              '*/*': {
                schema: {
                  $ref: '#/components/schemas/Plant',
                },
              },
            },
          },
          '404': {
            description: 'Not found.',
          },
        },
      },
      parameters: [
        {
          name: 'plantId',
          required: true,
          in: 'path',
          schema: {
            type: 'string',
          },
          example: 'storycounty',
        },
        {
          $ref: '#/components/parameters/embedDevices',
        },
      ],
    },
    '/devices': {
      get: {
        tags: ['devices'],
        description: 'Retrieve all devices related to authenticated user.',
        responses: {
          '200': {
            description: 'Successful response.',
            content: {
              '*/*': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Device',
                  },
                },
              },
            },
          },
        },
        parameters: [
          {
            $ref: '#/components/parameters/queryPlantId',
          },
        ],
      },
    },
    '/devices/{deviceId}': {
      get: {
        tags: ['devices'],
        description: 'Retrieve a single device with provided ID.',
        responses: {
          '200': {
            description: 'Successful response.',
            content: {
              '*/*': {
                schema: {
                  $ref: '#/components/schemas/Device',
                },
              },
            },
          },
          '404': {
            description: 'Not found.',
          },
        },
      },
      parameters: [
        {
          name: 'deviceId',
          required: true,
          in: 'path',
          schema: {
            type: 'string',
          },
          example: 'storycounty-2',
        },
      ],
    },
    '/metrics': {
      get: {
        tags: ['metrics'],
        description: 'Retrieve list of metrics for devices based on certain criteria.',
        responses: {
          '200': {
            description: 'Successful response.',
            content: {
              '*/*': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/DeviceMetrics',
                  },
                },
              },
            },
          },
        },
        parameters: [
          {
            $ref: '#/components/parameters/queryPlantId',
          },
          {
            $ref: '#/components/parameters/queryDeviceId',
          },
        ],
      },
    },
    '/devices/{deviceId}/metrics': {
      get: {
        tags: ['metrics'],
        description: 'Retrieve metric values for a single device.',
        responses: {
          '200': {
            description: 'Successful response.',
            content: {
              '*/*': {
                schema: {
                  $ref: '#/components/schemas/DeviceMetrics',
                },
              },
            },
          },
          '404': {
            description: 'Not found.',
          },
        },
      },
      parameters: [
        {
          name: 'deviceId',
          required: true,
          in: 'path',
          schema: {
            type: 'string',
          },
          example: 'storycounty-2',
        },
      ],
    },
    '/fault-definitions': {
      get: {
        tags: ['faults'],
        description: 'Retrieve all available sets of fault definitions.',
        responses: {
          '200': {
            description: 'Successful response.',
            content: {
              '*/*': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/FaultsDefinitionSet',
                  },
                },
              },
            },
          },
        },
      },
    },
    '/fault-definitions/{id}': {
      get: {
        tags: ['faults'],
        description: 'Retrieve a single set of fault definitions with the provided ID.',
        responses: {
          '200': {
            description: 'Successful response.',
            content: {
              '*/*': {
                schema: {
                  $ref: '#/components/schemas/FaultsDefinitionSet',
                },
              },
            },
          },
        },
      },
      parameters: [
        {
          name: 'id',
          description: 'ID of the faults definition set.',
          required: true,
          in: 'path',
          schema: {
            type: 'string',
          },
          example: '666',
        },
      ],
    },
    '/error-stacks': {
      get: {
        tags: ['error-stacks'],
        description:
          'Retrieve error stacks based on query parameters (filters, sorters...) or list all available stacks if no parameters are provided (for debugging purposes only). Stack details should not be provided in the list results, they will be fetched in a dedicated request.',
        responses: {
          '200': {
            description: 'Successful response.',
            content: {
              '*/*': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/ErrorStack',
                  },
                },
              },
            },
          },
        },
      },
      parameters: [
        {
          $ref: '#/components/parameters/queryPlantId',
        },
        {
          $ref: '#/components/parameters/queryDeviceId',
        },
        {
          $ref: '#/components/parameters/limit',
        },
        {
          $ref: '#/components/parameters/sort',
        },
        {
          $ref: '#/components/parameters/sortOrder',
        },
      ],
    },
    '/error-stacks/{stackId}': {
      get: {
        tags: ['error-stacks'],
        description: 'Retrieve an error stack with its details (values).',
        responses: {
          '200': {
            description: 'Successful response.',
            content: {
              '*/*': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/ErrorStack',
                  },
                },
              },
            },
          },
        },
      },
      parameters: [
        {
          name: 'stackId',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
          },
        },
      ],
    },
  },
  components: {
    schemas: {
      Plant: {
        type: 'object',
        required: ['id', 'name', 'deviceIds'],
        properties: {
          id: {
            type: 'string',
            example: 'storycounty',
          },
          name: {
            type: 'string',
            example: 'Story Country',
          },
          deviceIds: {
            type: 'array',
            items: {
              type: 'string',
              example: ['storycounty-0', 'storycounty-1', 'storycounty-2'],
            },
          },
          devices: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Device',
            },
            description: 'Included in response only if requested via _embed query parameter.',
            example: [
              {
                id: 'storycounty-0',
                name: '0',
                plantId: 'storycounty',
                state: 'wrn',
              },
              {
                id: 'storycounty-1',
                name: '1',
                plantId: 'storycounty',
                state: 'on',
              },
              {
                id: 'storycounty-2',
                name: '2',
                plantId: 'storycounty',
                state: 'err',
              },
            ],
          },
        },
      },
      Device: {
        type: 'object',
        required: ['id', 'name', 'plantId', 'state'],
        properties: {
          id: {
            type: 'string',
            example: 'storycounty-2',
          },
          name: {
            type: 'string',
            example: '2',
          },
          plantId: {
            type: 'string',
            example: 'storycounty',
          },
          state: {
            $ref: '#/components/schemas/DeviceState',
          },
        },
      },
      DeviceState: {
        type: 'string',
        enum: ['on', 'off', 'wrn', 'err', 'nc', 'srvc'],
        example: 'on',
        description: 'Current state of the device.',
      },
      DeviceSide: {
        type: 'string',
        enum: ['master', 'slave'],
        example: 'master',
        description:
          'TODO: Write a better description. Note the difference between wind turbines and solar inverters which have only a master part.',
      },
      DeviceMetrics: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description:
              'Unique ID across the system (Could be the same as deviceId). Will be used to track device metrics over web sockets.',
            example: 'storycounty-2-metrics',
          },
          deviceId: {
            type: 'string',
            description: 'ID of the device itself.',
            example: 'storycounty-2',
          },
          state: {
            $ref: '#/components/schemas/DeviceState',
          },
          powerLoad: {
            type: 'number',
            description: 'Percentage, E.g: 35 (displayed as 35%).',
            example: 35,
          },
          dailyEnergyProduction: {
            type: 'number',
            description: 'Floating point number in kWh E.g: 376.3 (displayed as 376.3 kWh).',
            example: 376.3,
          },
          totalEnergyProduction: {
            type: 'number',
            description: 'Floating point number in kWh E.g: 7433800.0 (displayed as 7433.8 MWh).',
            example: 7433800.0,
          },
          plantEnergyShare: {
            type: 'number',
            description: 'Percentage, E.g: 14 (displayed as 14%).',
            example: 14,
          },
          pvTotalPower: {
            type: 'number',
            description: 'Floating point number in kW, E.g: 185.5 (displayed as 185.5 kW).',
            example: 185.5,
          },
          pv1Power: {
            type: 'number',
            description: 'Floating point number in kW, E.g: 60.7 (displayed as 60.7 kW).',
            example: 60.7,
          },
          pv2Power: {
            type: 'number',
            description: 'Floating point number in kW, E.g: 60.8 (displayed as 60.8 kW).',
            example: 60.8,
          },
          pv3Power: {
            type: 'number',
            description: 'Floating point number in kW, E.g: 60.9 (displayed as 60.9 kW).',
            example: 60.9,
          },
          pv1Voltage: {
            type: 'number',
            description: 'Floating point number in volts. E.g: 627.0 (displayed as 627 V).',
            example: 627.0,
          },
          pv2Voltage: {
            type: 'number',
            description: 'Floating point number in volts. E.g: 628.0 (displayed as 628 V).',
            example: 628.0,
          },
          pv3Voltage: {
            type: 'number',
            description: 'Floating point number in volts. E.g: 629.0 (displayed as 629 V).',
            example: 629.0,
          },
          acPower: {
            type: 'number',
            description: 'Floating point number in kW, E.g: 177.0 (displayed as 177.0 kW).',
            example: 177.0,
          },
          acVoltage: {
            type: 'number',
            description: 'Floating point number in volts, E.g: 413.0 (displayed as 413 V).',
            example: 413.0,
          },
          acCurrent: {
            type: 'number',
            description: 'Floating point number in ampers, E.g: 248.4 (displayed as 248.4 A).',
            example: 248.4,
          },
          cabinetTemperature: {
            type: 'number',
            description: 'Floating point number in °C, E.g: 34.4 (displayed as 34.4°C).',
            example: 34.4,
          },
          liquidTemperature: {
            type: 'number',
            description: 'Floating point number in °C, E.g: 34.5 (displayed as 34.5°C).',
            example: 34.5,
          },
        },
      },
      Fault: {
        type: 'object',
        required: ['id', 'name', 'code'],
        properties: {
          id: {
            type: 'string',
            description:
              'Fault ID is unique accross the system and is further used to get various values related to a particular fault. Could be constructed as: <fault-definitions-id>.<device-side>.<group-code>.<fault-code>.',
            example: '666.x.284.07',
          },
          name: {
            type: 'string',
            description: 'Name of the particular fault.',
            example: 'Line IGBT module U (R4)',
          },
          code: {
            type: 'string',
            description:
              'Code is displayed along with the name to additionally identify the fault.',
            example: '07',
          },
          isWarning: {
            type: 'boolean',
            description: 'Faults are either warnings or errors.',
            example: true,
          },
          isMajor: {
            type: 'boolean',
            description: 'There are faults with higher priority, which are marked as major.',
            example: true,
          },
        },
      },
      FaultGroup: {
        type: 'object',
        required: ['id', 'name', 'code', 'faults'],
        properties: {
          id: {
            type: 'string',
            description:
              'Fault group ID is unique accross the system. Could be constructed as: <fault-definitions-id>.<device-side>.<group-code>.',
            example: '666.x.284',
          },
          name: {
            type: 'string',
            description: 'Name of the group.',
            example: 'Hardware faults',
          },
          code: {
            type: 'string',
            description:
              'Code is displayed along with the name to additionally identify the group.',
            example: '284',
          },
          faults: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Fault',
            },
          },
        },
      },
      FaultsDefinitionSet: {
        type: 'object',
        required: ['id', 'master'],
        description:
          'Unites a prefedined set of faults definitions organized into groups for each machine side. Each set is identified by an ID (Version). Each device refers to a particular set of fault definitions.',
        properties: {
          id: {
            type: 'string',
            example: '666',
            description:
              'Different sets of faults are identified by this ID, which could also be treated as a version.',
          },
          master: {
            type: 'array',
            description:
              'Master side is applicable for both solar inverters and wind turbine converters.',
            items: {
              $ref: '#/components/schemas/FaultGroup',
            },
          },
          slave: {
            type: 'array',
            description: 'Slave side is not applicable for solar inverters.',
            items: {
              $ref: '#/components/schemas/FaultGroup',
            },
          },
        },
      },
      ErrorStackIndexValue: {
        type: 'number',
        enum: [0, 1, 2, 3],
        description: 'Legend: 0 = Not Available; 1 = OK; 2 = Warning; 3 = Error;',
      },
      ErrorStack: {
        type: 'object',
        required: ['id', 'deviceId', 'plantId', 'deviceSide', 'timestamp'],
        properties: {
          id: {
            type: 'string',
            example: 'stack-id-83',
            description:
              'Uniquiely identifies a particular error stack across the system. A uniquie ID could be constructed from <device-id> + <machine-side> + <stack-timestamp>.',
          },
          deviceId: {
            type: 'string',
            example: 'storycounty-2',
            description: 'ID of the concerned device.',
          },
          plantId: {
            type: 'string',
            example: 'storycounty',
            description: 'ID of the concerned plant.',
          },
          deviceSide: {
            $ref: '#/components/schemas/DeviceSide',
          },
          timestamp: {
            type: 'string',
            example: '2020-05-08T07:33:03.710Z',
            description:
              'Time of occurence of the stack. Timestamps are always in UTC time and are formatted according to ISO-8601 standard.',
          },
          details: {
            type: 'object',
            required: ['stackSize', 'currentIndex', 'values'],
            description: 'Included in response only if explicitly requested.',
            properties: {
              stackSize: {
                type: 'number',
                example: 8,
                description: 'Number of stack indices (usually 4 or 8).',
              },
              currentIndex: {
                type: 'number',
                example: 3,
                description: 'The last index in the circular buffer.',
              },
              values: {
                type: 'object',
                description:
                  'A dictionary of Key-Value pairs, where the Key is Fault ID and the Value is an array of ErrorStackIndexValue.',
                additionalProperties: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/ErrorStackIndexValue',
                  },
                },
                example: {
                  '666.x.284.07': [1, 1, 3, 1, 1, 3, 1, 1],
                  '666.x.284.08': [1, 1, 1, 3, 3, 1, 1, 1],
                  '666.x.284.09': [1, 1, 1, 1, 1, 1, 1, 1],
                },
              },
            },
          },
        },
      },
    },
    parameters: {
      embedDevices: {
        name: '_embed',
        in: 'query',
        description: 'Include additional fields in the response.',
        schema: {
          type: 'string',
          enum: ['devices'],
        },
      },
      limit: {
        name: '_limit',
        in: 'query',
        description: 'Limit returned results.',
        schema: {
          type: 'number',
        },
      },
      sort: {
        name: '_sort',
        in: 'query',
        description: 'Sort by.',
        schema: {
          type: 'string',
          description: 'Name of the property to sort by.',
        },
      },
      sortOrder: {
        name: '_order',
        in: 'query',
        description: 'Sort order.',
        schema: {
          type: 'string',
          enum: ['asc', 'desc'],
        },
      },
      queryPlantId: {
        name: 'plantId',
        in: 'query',
        description: 'Filter by plant ID.',
        schema: {
          type: 'string',
        },
      },
      queryDeviceId: {
        name: 'deviceId',
        in: 'query',
        description: 'Filter by device ID.',
        schema: {
          type: 'string',
        },
      },
    },
  },
};
