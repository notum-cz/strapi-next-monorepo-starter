import React from 'react';

export interface ActivityData {
  date: string;
  count: number;
  level: number;
}

interface ContributionGraphBlockProps {
  activity: ActivityData;
  dayIndex: number;
  weekIndex: number;
}

interface ContributionGraphCalendarProps {
  children: (props: ContributionGraphBlockProps) => React.ReactNode;
}

interface ContributionGraphFooterProps {
  children: React.ReactNode;
}

interface ContributionGraphTotalCountProps {}

interface ContributionGraphLegendProps {}

interface ContributionGraphProps {
  data: ActivityData[];
  children: React.ReactNode;
}

export const ContributionGraph: React.FC<ContributionGraphProps> = ({ data, children }) => {
  return <div className="contribution-graph">{children}</div>;
};

export const ContributionGraphCalendar: React.FC<ContributionGraphCalendarProps> = ({ children }) => {
  // Group data by weeks
  const weeks: ActivityData[][] = [];
  let week: ActivityData[] = [];
  let currentMonth = -1;

  data.forEach((activity, index) => {
    const day = new Date(activity.date);
    const dayOfWeek = day.getUTCDay();

    if (day.getUTCMonth() !== currentMonth) {
      currentMonth = day.getUTCMonth();
      if (week.length > 0) {
        weeks.push([...week]);
        week = [];
      }
    }

    week[dayOfWeek] = activity;

    if (index === data.length - 1 || (index + 1) % 7 === 0) {
      weeks.push([...week]);
      week = Array(7).fill(null);
      for (let i = 0; i < 7; i++) {
        if (!week[i]) week[i] = { date: '', count: 0, level: 0 };
      }
    }
  });

  return (
    <div className="contribution-calendar">
      {weeks.map((weekData, weekIndex) =>
        weekData.map((activity, dayIndex) => (
          <div key={`${weekIndex}-${dayIndex}`}>
            {activity ? children({ activity, dayIndex, weekIndex }) : null}
          </div>
        ))
      )}
    </div>
  );
};

export const ContributionGraphBlock: React.FC<ContributionGraphBlockProps> = ({
  activity,
  dayIndex,
  weekIndex,
}) => {
  const level = activity.level;
  const colors = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];

  return (
    <div
      className={`block`}
      style={{ backgroundColor: colors[level] }}
      title={`${activity.date}: ${activity.count} contributions`}
    />
  );
};

export const ContributionGraphFooter: React.FC<ContributionGraphFooterProps> = ({ children }) => {
  return <div className="contribution-footer">{children}</div>;
};

export const ContributionGraphTotalCount: React.FC<ContributionGraphTotalCountProps> = () => {
  return <span>Total: Calculated</span>;
};

export const ContributionGraphLegend: React.FC<ContributionGraphLegendProps> = () => {
  return (
    <div className="legend">
      Less
      <div className="legend-items">
        <div style={{ backgroundColor: '#ebedf0' }} />
        <div style={{ backgroundColor: '#9be9a8' }} />
        <div style={{ backgroundColor: '#40c463' }} />
        <div style={{ backgroundColor: '#30a14e' }} />
        <div style={{ backgroundColor: '#216e39' }} />
      </div>
      More
    </div>
  );
};
