"use client"

import { useState, useEffect } from "react"

export function AnalogClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const secondAngle = time.getSeconds() * 6 - 90 // 6 degrees per second
  const minuteAngle = time.getMinutes() * 6 + time.getSeconds() * 0.1 - 90 // 6 degrees per minute + smooth seconds
  const hourAngle = (time.getHours() % 12) * 30 + time.getMinutes() * 0.5 - 90 // 30 degrees per hour + smooth minutes

  return (
    <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32">
      {/* Clock Face */}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-100 rounded-full border-4 border-gray-300 shadow-lg">
        {/* Hour Markers */}
        {[...Array(12)].map((_, i) => {
          const angle = i * 30 - 90
          const isMainHour = i % 3 === 0
          return (
            <div
              key={i}
              className={`absolute ${isMainHour ? "w-0.5 h-3 bg-gray-800" : "w-0.5 h-2 bg-gray-600"}`}
              style={{
                left: "50%",
                top: "6px",
                transformOrigin: "50% calc(100% + 34px)",
                transform: `translateX(-50%) rotate(${angle + 90}deg)`,
              }}
            />
          )
        })}

        {/* Digital Time Display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/80 text-white text-xs sm:text-sm px-1.5 py-0.5 rounded font-mono">
            {time.toLocaleTimeString("ar-SA", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        {/* Hour Hand */}
        <div
          className="absolute w-0.5 bg-gray-800 rounded-full origin-bottom z-30"
          style={{
            height: "25%",
            left: "50%",
            bottom: "50%",
            transformOrigin: "50% 100%",
            transform: `translateX(-50%) rotate(${hourAngle}deg)`,
          }}
        />

        {/* Minute Hand */}
        <div
          className="absolute w-0.5 bg-gray-700 rounded-full origin-bottom z-20"
          style={{
            height: "35%",
            left: "50%",
            bottom: "50%",
            transformOrigin: "50% 100%",
            transform: `translateX(-50%) rotate(${minuteAngle}deg)`,
          }}
        />

        {/* Second Hand */}
        <div
          className="absolute w-px bg-red-500 rounded-full origin-bottom z-10 transition-transform duration-75"
          style={{
            height: "40%",
            left: "50%",
            bottom: "50%",
            transformOrigin: "50% 100%",
            transform: `translateX(-50%) rotate(${secondAngle}deg)`,
          }}
        />

        {/* Center Dot */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gray-800 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-40"></div>
      </div>
    </div>
  )
}
