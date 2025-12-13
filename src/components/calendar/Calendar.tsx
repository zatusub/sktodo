import { useState } from 'react';
import './Calendar.css';

interface Todo {
  content: string;
  deadline: string; // ISO 8601形式の日付文字列を想定 (例: "2025-12-15")
}

interface CalendarProps {
  todos: Todo[];
}

export function Calendar({ todos }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // 現在表示している月の情報を取得
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 月の最初の日と最後の日を取得
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // 月の最初の日の曜日（0: 日曜日, 1: 月曜日, ...）
  const firstDayWeekday = firstDayOfMonth.getDay();

  // 月の日数
  const daysInMonth = lastDayOfMonth.getDate();

  // 前月に移動
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // 次月に移動
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // 今月に戻る
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 日付に対応するTODOを取得
  const getTodosForDate = (day: number): Todo[] => {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return todos.filter(todo => {
      // deadlineから日付部分のみを取得して比較
      const todoDate = todo.deadline.split('T')[0];
      return todoDate === dateString;
    });
  };

  // カレンダーの日付セルを生成
  const renderCalendarDays = () => {
    const days = [];

    // 空白セルを追加（月の最初の日が日曜日でない場合）
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // 月の各日のセルを追加
    for (let day = 1; day <= daysInMonth; day++) {
      const todosForDay = getTodosForDate(day);
      const isToday =
        day === new Date().getDate() &&
        month === new Date().getMonth() &&
        year === new Date().getFullYear();

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${todosForDay.length > 0 ? 'has-todos' : ''}`}
        >
          <div className="day-number">{day}</div>
          <div className="todos-container">
            {todosForDay.map((todo, index) => (
              <div key={index} className="todo-item" title={todo.content}>
                {todo.content}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="calendar-wrapper">
      <div className="calendar-header">
        <button onClick={goToPreviousMonth} className="nav-button">
          ◀ 前月
        </button>
        <div className="current-month">
          {year}年 {month + 1}月
        </div>
        <button onClick={goToNextMonth} className="nav-button">
          次月 ▶
        </button>
      </div>
      <button onClick={goToToday} className="today-button">
        今日
      </button>

      <div className="calendar-grid">
        <div className="weekday-header">日</div>
        <div className="weekday-header">月</div>
        <div className="weekday-header">火</div>
        <div className="weekday-header">水</div>
        <div className="weekday-header">木</div>
        <div className="weekday-header">金</div>
        <div className="weekday-header">土</div>

        {renderCalendarDays()}
      </div>
    </div>
  );
};

export default Calendar;
