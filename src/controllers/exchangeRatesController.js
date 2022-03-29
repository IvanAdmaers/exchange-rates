import cache from 'memory-cache-pro';

import {
  modifyWithBase,
  sortObjectAlphabetically,
  modifyWithSymbols,
  modifyWithAmount,
  formatDate,
  getDatesInRange,
} from '../utills';
import { LATEST_RATES_DATE_CACHE_KEY } from '../constants';

import ratesList from '../cache/rates.json';

const latestDateKey =
  cache.get(LATEST_RATES_DATE_CACHE_KEY) || Object.keys(ratesList)[0];

const defineEndpoint = ({ startDate, endDate, date }) => {
  if (startDate && endDate) {
    return 'timeseries';
  }

  if (date) {
    return 'historical';
  }

  return 'latest';
};

const modifyRates = ({ rates, base, symbols, amount, isTimeseries }) => {
  const doModify = (ratesItem) => {
    const modifiedWithBase = modifyWithBase(base, ratesItem);

    const modifiedWithSymbols = modifyWithSymbols(symbols, modifiedWithBase);

    const paramAmount = amount ? +amount : 1;

    const modifiedWithAmount = modifyWithAmount(
      paramAmount,
      modifiedWithSymbols
    );

    const sortedByAlphabetically = sortObjectAlphabetically(modifiedWithAmount);

    return sortedByAlphabetically;
  };

  if (!isTimeseries) {
    return doModify(rates);
  }

  const result = {};
  const keys = Object.entries(rates);

  keys.forEach(([date, value]) => {
    const composed = doModify(value);

    result[date] = composed;
  });

  return result;
};

const getLatestRates = () => ratesList[latestDateKey];
const getHistoricalRates = (date) => ratesList[date];
const getTimeseriesRates = (startDate, endDate) => {
  const result = {};

  const dates = getDatesInRange(startDate, endDate);
  const dateList = dates.map((itemDate) => formatDate(itemDate));

  dateList.forEach((itemDate) => {
    const dateData = ratesList[itemDate];

    if (!dateData) {
      return;
    }

    result[itemDate] = dateData;
  });

  return result;
};

const getRatesList = ({ endpoint, date, startDate, endDate }) => {
  switch (endpoint) {
    case 'latest':
      return getLatestRates();

    case 'historical':
      return getHistoricalRates(date);

    case 'timeseries':
      return getTimeseriesRates(startDate, endDate);

    default:
      throw new Error('Endpoint is unknown');
  }
};

export const rates = async (req, res) => {
  const {
    base,
    symbols,
    amount,
    start_date: startDate,
    end_date: endDate,
  } = req.query;
  const { date } = req.params;

  const endpoint = defineEndpoint({ date, startDate, endDate });
  const isTimeseries = endpoint === 'timeseries';

  const currentRatesList = getRatesList({
    endpoint,
    date,
    startDate,
    endDate,
  });

  const ratesData = !currentRatesList
    ? null
    : modifyRates({
        rates: currentRatesList,
        base,
        symbols,
        amount,
        isTimeseries,
      });

  return res.json({ rates: ratesData, endpoint });
};
