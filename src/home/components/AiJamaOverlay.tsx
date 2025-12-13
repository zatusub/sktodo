import { useEffect, useState } from "react";
import "./aiJama.css";

type Props = {
  message: string;
  faceImageUrl: string; // 悪い顔の画像
};

export default function AiJamaOverlay({ message, faceImageUrl }: Props) {
  const [pos, setPos] = useState({ x: 60, y: 60 });
  const [rot, setRot] = useState(0);

  useEffect(() => {
    const move = () => {
      const x = Math.random() * (window.innerWidth - 220);
      const y = Math.random() * (window.innerHeight - 220);
      const r = Math.random() * 20 - 10;

      setPos({ x, y });
      setRot(r);
    };

    move(); // 初期位置
    const id = setInterval(move, 3500); // 勝手に移動

    return () => clearInterval(id);
  }, []);

  if (!message) return null;

  return (
    <div
      className="ai-jama-root"
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px) rotate(${rot}deg)`
      }}
    >
      <img src={faceImageUrl} className="ai-jama-face" />

      <div className="ai-jama-balloon">
        {message}
      </div>
    </div>
  );
}
