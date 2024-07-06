import * as storage from 'azure-storage';

import { TableStorageRecord } from './types';
import { getAllPartitionKeys } from './getByPartitionKey';

const TABLE_NAME_OTA_LOGS = 'gOtaLogs';

export interface OtaActionRecord {
  jobId: string;
  serial: string;
  appVersion: string;
  hwProfile: string;
  requestTimeStamp: string;
  responseTimeStamp: string;
  agentResponse: string;
}

function mkProcessor(actionName: string) {
  let counter = 0;
  const records: Record<string, OtaActionRecord> = {};

  return {
    processor: (entity: TableStorageRecord): boolean => {
      try {
        // const water_lvl = entity.props['water_lvl'];
        //const wl_errors = entity.props['wl_errors'];
        const messageTimeStamp = entity.timeStamp;
        const nature = entity.props['nature'];
        counter += 1;
        console.log('# counter:', counter);

        if (nature === 'action_to_run') {
          const actionToRunProp = entity.props['actionToRun'];

          const actionToRun = JSON.parse(actionToRunProp);
          if (actionToRun.actionName === actionName) {
            const jobId = actionToRun.jobId;
            // console.log(
            //   `>action_to_run>${entity.partitionKey}>jobId>${jobId}>messageTimeStamp>${messageTimeStamp}`,
            // );
            const requestTimeStamp = new Date(messageTimeStamp).toISOString();
            if (records[jobId]) {
              records[jobId].requestTimeStamp = requestTimeStamp;
            } else {
              const deviceInformationProp = entity.props['deviceInformation'];
              const deviceInformation = JSON.parse(deviceInformationProp);
              records[jobId] = {
                jobId,
                agentResponse: '',
                requestTimeStamp,
                responseTimeStamp: '',
                serial: deviceInformation.serial,
                appVersion: deviceInformation.appVersion,
                hwProfile: deviceInformation.hwProfile,
              };
            }
          }
        } else if (nature === 'agent_response') {
          const requestJobId = entity.props['requestJobId'];
          if (requestJobId.startsWith(`${actionName}.`)) {
            // console.log(
            //   `>agent_response>${entity.partitionKey}>jobId>${requestJobId}>messageTimeStamp>${messageTimeStamp}`,
            // );
            const agentResponse = entity.props['agent_response'];
            const deviceInformationProp = entity.props['deviceInformation'];
            const deviceInformation = JSON.parse(deviceInformationProp);
            const responseTimeStamp = new Date(messageTimeStamp).toISOString();

            if (records[requestJobId]) {
              records[requestJobId].responseTimeStamp = responseTimeStamp;
              records[requestJobId].agentResponse = agentResponse;
              records[requestJobId].serial = deviceInformation.serial;
              records[requestJobId].appVersion = deviceInformation.appVersion;
              records[requestJobId].hwProfile = deviceInformation.hwProfile;
            } else {
              records[requestJobId] = {
                jobId: requestJobId,
                agentResponse: agentResponse,
                requestTimeStamp: '',
                responseTimeStamp,
                serial: deviceInformation.serial,
                appVersion: deviceInformation.appVersion,
                hwProfile: deviceInformation.hwProfile,
              };
            }
          }
        }
        // we want process all the records
        return true;
      } catch (err) {
        console.log('# processor error:');
        console.log(err);
        console.log(entity);
        return true;
      }
    },
    getOtaRecords(): OtaActionRecord[] {
      return Object.values(records);
    },
  };
}

export default async function getOtaActionResult(
  tableService: storage.TableService,
  actionName: string,
): Promise<OtaActionRecord[]> {
  const processor = mkProcessor(actionName);

  await getAllPartitionKeys(
    tableService,
    TABLE_NAME_OTA_LOGS,
    [],
    -1,
    processor.processor,
  );
  return processor.getOtaRecords();
}
