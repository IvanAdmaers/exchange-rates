import { Endpoint } from '../../typescript/objects';

const { Timeseries, Historical, Latest } = Endpoint;

/**
 * This function defines an endpoint
 */
const defineEndpoint = ({
  startDate,
  endDate,
  date,
}: {
  startDate?: string;
  endDate?: string;
  date?: string;
}) => {
  if (startDate && endDate) {
    return Timeseries;
  }

  if (date) {
    return Historical;
  }

  return Latest;
};

export default defineEndpoint;
