import Calendar from '../components/calendar/Calendar';

const CalendarTestPage = () => {
  const todos = [
    { content: "プロジェクト提出", deadline: "2025-12-15" },
    { content: "会議準備", deadline: "2025-12-20" },
    { content: "レポート作成", deadline: "2025-12-15" }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1>Calendar Test Page</h1>
      <Calendar todos={todos} />
    </div>
  );
};

export default CalendarTestPage;
