import React, { useState, useEffect } from 'react';
import './AnalogClock.css';

const AnalogClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const updateTime = () => {
      // Get current time in WITA (Asia/Makassar - UTC+8)
      const now = new Date();
      setTime(now);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get WITA time components directly from timezone
  const getWITATime = () => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Makassar',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const parts = formatter.formatToParts(time);
    const hourPart = parts.find(p => p.type === 'hour');
    const minutePart = parts.find(p => p.type === 'minute');
    const secondPart = parts.find(p => p.type === 'second');
    
    const hours = hourPart ? parseInt(hourPart.value) : time.getHours();
    const minutes = minutePart ? parseInt(minutePart.value) : time.getMinutes();
    const seconds = secondPart ? parseInt(secondPart.value) : time.getSeconds();
    
    return { hours, minutes, seconds };
  };

  const { hours: witaHours, minutes: witaMinutes, seconds: witaSeconds } = getWITATime();
  const hours = witaHours % 12 || 12;
  const minutes = witaMinutes;
  const seconds = witaSeconds;

  const hourAngle = (hours * 30) + (minutes * 0.5);
  const minuteAngle = minutes * 6;
  const secondAngle = seconds * 6;

  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Makassar'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Makassar'
    });
  };

  return (
    <div className="analog-clock-container">
      <div className="clock-wrapper">
        <div className="clock-face">
          {/* Clock numbers */}
          {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, index) => {
            const angle = (index * 30) - 90;
            // Radius dikurangi agar angka berada di dalam border biru (sekitar 42% dari radius)
            // Ini akan membuat angka berada di dalam lingkaran biru seperti jam dinding
            const radius = 42;
            const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
            const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
            const is12 = num === 12;
            return (
              <span
                key={num}
                className={`clock-number ${is12 ? 'number-12' : ''}`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: is12 ? 30 : 20
                }}
              >
                {num}
              </span>
            );
          })}

          {/* Hour marks */}
          {Array.from({ length: 60 }).map((_, i) => {
            const angle = (i * 6) - 90;
            const isHourMark = i % 5 === 0;
            // Skip semua mark (hour dan minute) di posisi 12 (index 0) agar tidak menutup angka 12
            const is12OClock = i === 0;
            if (is12OClock) {
              return null; // Tidak render mark apapun di posisi 12
            }
            return (
              <div
                key={i}
                className={`clock-mark ${isHourMark ? 'hour-mark' : 'minute-mark'}`}
                style={{
                  transform: `rotate(${angle}deg) translateY(-45%)`,
                  transformOrigin: '50% 50%'
                }}
              />
            );
          })}

          {/* Hour hand */}
          <div
            className="clock-hand hour-hand"
            style={{
              transform: `rotate(${hourAngle}deg)`
            }}
          />

          {/* Minute hand */}
          <div
            className="clock-hand minute-hand"
            style={{
              transform: `rotate(${minuteAngle}deg)`
            }}
          />

          {/* Second hand */}
          <div
            className="clock-hand second-hand"
            style={{
              transform: `rotate(${secondAngle}deg)`
            }}
          />

          {/* Center dot */}
          <div className="clock-center" />
        </div>
      </div>
      <div className="clock-info">
        <div className="digital-time">{formatTime(time)}</div>
        <div className="date-info">{formatDate(time)}</div>
      </div>
    </div>
  );
};

export default AnalogClock;

