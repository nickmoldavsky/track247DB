import Moment from 'moment';

const DateTimeHelper = {
  getFormattedDatetime: (datetime: string) => {
    return Moment.utc(datetime).local().format("MMM Do, YYYY, h:mm a");
  },
};

export default DateTimeHelper;
