import './TodoDetailDisplay.css';
import { useState, useEffect } from "react";

export function TodoDetailDisplay() {
  const [detail, setDetail] = useState("");
  const [date, setDate] = useState("");
  const [taskName, setTaskName] = useState("");

  // ���񃍁[�h���ɕۑ��ς݃f�[�^��ǂݍ���
  useEffect(() => {
    const savedDetail = localStorage.getItem("detail");
    if (savedDetail) setDetail(savedDetail);
    const savedTaskName = localStorage.getItem("taskName");
    const savedDate = localStorage.getItem("todoDate");
    if (savedTaskName) setTaskName(savedTaskName);
    if (savedDate) setDate(savedDate);
    }, []);

  // �ۑ�����
  const handleSave = () => {
    localStorage.setItem("detail", detail);
    localStorage.setItem("todoDate", date);
    localStorage.setItem("taskName", taskName);
    
    alert("\u4fdd\u5b58\u3057\u307e\u3057\u305f\uff01");
    // �u�ۑ����܂����I�v
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

      {/* �ڍד��̓X�y�[�X */}
      <div className="detail-space">
        <h2>{'\u8a73\u7d30'}</h2>
        <textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          rows={6}
          cols={40}
        />
      </div>

      <button onClick={handleSave}>{'\u4fdd\u5b58'}</button>
    </div>
  );
}