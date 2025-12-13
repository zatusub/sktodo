import './TodoDetailDisplay.css';
import React, { useState, useEffect } from "react";

export function TodoDetailDisplay() {
  const [detail, setDetail] = useState("");
  const [info, setInfo] = useState("");
  const [date, setDate] = useState("");
  const [taskName, setTaskName] = useState("");

  // 初回ロード時に保存済みデータを読み込む
  useEffect(() => {
    const savedDetail = localStorage.getItem("detail");
    const savedInfo = localStorage.getItem("info");
    if (savedDetail) setDetail(savedDetail);
    if (savedInfo) setInfo(savedInfo);
    const savedTaskName = localStorage.getItem("taskName");
    const savedDate = localStorage.getItem("todoDate");
    if (savedTaskName) setTaskName(savedTaskName);
    if (savedDate) setDate(savedDate);
    }, []);

  // 保存処理
  const handleSave = () => {
    localStorage.setItem("detail", detail);
    localStorage.setItem("info", info);
    localStorage.setItem("todoDate", date);
    localStorage.setItem("taskName", taskName);
    
    alert("\u4fdd\u5b58\u3057\u307e\u3057\u305f\uff01");
    // 「保存しました！」
  };

  return (
    <div className="todo-detail">
      <h2>{'\u30bf\u30b9\u30af\u540d'}<input type="text"value={taskName}onChange={(e) => setTaskName(e.target.value)}
      style={{ fontSize: "1.1em", fontWeight: "normal" }} /></h2>
      <p> {'\u65e5\u4ed8'}
      <input type="date" 
      value={date}
      onChange={(e) => setDate(e.target.value)} />
      </p>

      {/* 詳細入力スペース */}
      <div className="detail-space">
        <h2>{'\u8a73\u7d30'}</h2>
        <textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          rows={6}
          cols={40}
        />
      </div>

      {/* 関連情報入力スペース */}
      <div className="info-space">
        <h2>{'\u95a2\u9023\u60c5\u5831'}</h2>
        <textarea
          value={info}
          onChange={(e) => setInfo(e.target.value)}
          rows={6}
          cols={40}
        />
      </div>

      <button onClick={handleSave}>{'\u4fdd\u5b58'}</button>
    </div>
  );
}