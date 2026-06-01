//------------------------------------------------------------------------------------
// Fault counters
//

/*

Query
    GET /fault-counters

Query parameters
    deviceId: string; // E.g: "2"
    from: string;     // E.g: "2022-12-12T07:17:19.937Z"
    to: string;       // E.g: "2022-12-19T07:17:19.937Z"

Response: <FaultCountersDTO> {
    deviceId: string; // Equals query param
    from: string;     // Equals query param
    to: string;       // Equals query param

    maxValue: number;
    values: {
        [faultId: string]: number; // E.g: faultId: "m.280.03", value: 43
    };
}

*/
export interface FaultCountersDTO {
  maxValue: number;
  values: {
    [faultId: string]: number; // E.g. faultId: m.280.03, value: 43
  };
}

/*

Fault counters with integration period

Query
    GET /fault-counters-split

Query parameters
    deviceId: string;           // E.g: "2"
    faultId: string;            // E.g: "m.280.03"
    from: string;               // E.g: "2022-12-12T07:17:19.000Z"
    to: string;                 // E.g: "2022-12-19T07:17:19.000Z"
    intergationPeriod: string;  // One of 'hours' | 'days' | 'months'

Response: <FaultCountersWithIntegrationPeriodDTO> {
    deviceId: string;           // Equals query param
    faultId: string;            // Equals query param
    from: string;               // Equals query param
    to: string;                 // Equals query param
    intergationPeriod: string;  // Equals query param

    maxValue: number;
    values: { timestamp: string; value: number }[]; // See explanation below
}

Values is an array of objects for each integration period point. 
Each object represents the number of faults ("value") that occured in a period of time 
starting from "timestamp" with duration "integrationPeriod".

For example, if integrationPeriod is set to 'hour', values array will contain:

    values: [
      {
        timestamp: "2022-12-12T07:17:19.000Z", // equals timestamp "from"
        value: 10
      },
      {
        timestamp: "2022-12-12T08:17:19.000Z", // an hour later
        value: 3
      },
      {
        timestamp: "2022-12-12T09:17:19.000Z", // two hours later
        value: 16
      },
      ...
    ]
    
*/
export interface FaultCountersWithIntegrationPeriodDTO {
  deviceId: string;
  faultId: string;
  from: string;
  to: string;
  integrationPeriod: string; // 'hours' | 'days' | 'months';

  maxValue: number;
  values: { timestamp: string; value: number }[];
}
