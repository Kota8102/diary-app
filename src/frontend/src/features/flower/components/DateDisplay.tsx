import dayjs from 'dayjs'

type DateDisplayProps = {
  date: string;
};

export const DateDisplay = ({ date }: DateDisplayProps) => {
  const month = dayjs(date).locale('en').format('MMM')
  const day = dayjs(date).format('DD')

  return (
    <div className="inline-block font-sans relative h-32">
      <div className="absolute top-0 left-0">
        <span className="text-3xl font-light tracking-tight">{month}.</span>
      </div>
      <svg
        className="absolute -top-1 left-2 w-16 h-32"
        viewBox="0 0 64 128"
      >
        <title>Diagonal line</title>
        <line
          x1="2"
          y1="102"
          x2="62"
          y2="26"
          stroke="black"
          strokeWidth="1.5"
        />
      </svg>
      <div className="absolute top-12 left-16">
        <span className="text-6xl font-normal tracking-tight">{day}</span>
      </div>
    </div>
  );
};