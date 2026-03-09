import { useEffect, useRef, useState } from "react";

const now = new Date();
const dateStr = now.toLocaleDateString("zh-TW", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "long",
});

export default function HeaderCard() {
  const [deg, setDeg] = useState({ x: 0, y: 0 });
  const [inputType, setInputType] = useState<"none" | "mouse" | "gyro">("none");

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      setInputType("mouse");
      const rect = cardRef.current.getBoundingClientRect();
      // Calculate mouse position relative to the center of the card
      const y = -((e.clientY - rect.top - rect.height / 2) / rect.height) * 10;
      const x = ((e.clientX - rect.left - rect.width / 2) / rect.width) * 10;
      setDeg({ x: y, y: x });
    };

    const handleMouseLeave = () => {
      setInputType("none");
      setDeg({ x: 0, y: 0 });
    };

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return;
      setInputType("gyro");

      // 假設自然拿手機的角度為 45 度 (beta)
      const beta = Math.max(-45, Math.min(45, e.beta - 45));
      const gamma = Math.max(-45, Math.min(45, e.gamma));

      const x = -(beta / 45) * 15;
      const y = (gamma / 45) * 10;
      setDeg({ x, y });
    };

    const el = cardRef.current;
    if (el) {
      el.addEventListener("mousemove", handleMouseMove);
      el.addEventListener("mouseleave", handleMouseLeave); // 改用 mouseleave 避免子元素干擾而頻繁閃爍
    }

    if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleDeviceOrientation);
    }

    return () => {
      if (el) {
        el.removeEventListener("mousemove", handleMouseMove);
        el.removeEventListener("mouseleave", handleMouseLeave);
      }
      if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
        window.removeEventListener(
          "deviceorientation",
          handleDeviceOrientation,
        );
      }
    };
  }, []);

  const transitionStyle =
    inputType === "none"
      ? "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)" // 返回原本位置時的平滑過渡
      : inputType === "gyro"
        ? "transform 0.15s linear" // 陀螺儀的跟隨
        : "transform 0.1s ease-out"; // 滑鼠的跟隨

  return (
    <div
      className="mx-auto max-w-2xl px-4"
      style={{
        transform: `perspective(1000px) rotateX(${deg.x}deg) rotateY(${deg.y}deg)`,
        transition: transitionStyle,
      }}
      ref={cardRef}
    >
      <div className="relative overflow-hidden rounded-4xl bg-indigo-950 px-8 py-10 shadow-2xl sm:px-12 sm:py-16">
        {/* 背景裝飾 */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-blue-200 backdrop-blur-md ring-1 ring-white/20 mb-5">
            建國高級中學
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            110 班{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-300 to-indigo-300">
              作業提醒
            </span>
          </h1>
          <p className="mt-4 text-base text-blue-100/80 font-medium tracking-wide">
            {dateStr}
          </p>
        </div>
      </div>
    </div>
  );
}
