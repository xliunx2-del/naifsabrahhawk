"use client"

import type React from "react"
import { useState } from "react"
import { AnalogClock } from "./analog-clock"

interface FoodItem {
  name: string
  image: string
  position?: string
  side?: string
}

interface FoodWheelProps {
  onFoodClick: (foodName: string) => void
  highlightedFoods: string[]
  selectedFood: string | null
  isLoading: boolean
  animalPredictions: string[]
  onSequenceClick?: (foodName: string) => void
}

const foods: FoodItem[] = [
  {
    name: "كتكوت",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%D9%83%D8%AA%D9%83%D9%88%D8%AA-rc3x4hx7CMUYbKuNPeVUnmmsdhUePO.png",
    position: "12",
  },
  {
    name: "طماط",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%D8%B7%D9%85%D8%A7%D8%B7-3KzSD9DMNhmPWJuE2DkZ5SKAcaQQOM.png",
    position: "1.5",
  },
  {
    name: "بقره",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%D8%A8%D9%82%D8%B1%D9%87-WrwxQ6cF8ydpubPg2mqpcxlu89swJO.png",
    position: "3",
  },
  {
    name: "بيبار",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%D8%A8%D9%8A%D8%A8%D8%A7%D8%B1-G5uCdMco2CSd4Wfqlb6MjmuMe5RWUz.png",
    position: "4.5",
  },
  {
    name: "سمكة",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%D8%B3%D9%85%D9%83%D8%A9-ohKOUzWWYpN9CT6AgRQfcPde4Y8M6p.png",
    position: "6",
  },
  {
    name: "جزر",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%D8%AC%D8%B2%D8%B1-hzo7SPcs5FVMe2FkBt1BQH2Fxz9Enk.png",
    position: "7.5",
  },
  {
    name: "جمبري",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%D8%AC%D9%85%D8%A8%D8%B1%D9%8A-9eejHqlsBac6yecbZcX8oLzmWVcx4O.png",
    position: "9",
  },
  {
    name: "ذرة",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%D8%B0%D8%B1%D8%A9-V4s67eszTRcr2QWxj6L4u829p9WbRs.png",
    position: "10.5",
  },
]

const bottomFoods: FoodItem[] = [
  {
    name: "سلطة",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%D8%B3%D9%84%D8%B7%D8%A9-wCI0VYOmhVJ2sepNw6kDyW0z0s4ibG.png",
    side: "left",
  },
  {
    name: "بيتزا",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%D8%A8%D9%8A%D8%AA%D8%B2%D8%A7-MnSmsdMNwQmYTDZ9Ut23CFvNJgQvdL.png",
    side: "right",
  },
]

export function FoodWheel({
  onFoodClick,
  highlightedFoods,
  selectedFood,
  isLoading,
  animalPredictions = [],
  onSequenceClick,
}: FoodWheelProps) {
  const [hoveredFood, setHoveredFood] = useState<string | null>(null)

  const getClockPosition = (position: string, screenSize: "sm" | "md" | "lg" = "md") => {
    const angle = Number.parseFloat(position) * 30 - 90 // Convert to degrees
    const radiusMap = {
      sm: 100, // Mobile
      md: 140, // Tablet
      lg: 160, // Desktop
    }
    const radius = radiusMap[screenSize]
    const x = Math.cos((angle * Math.PI) / 180) * radius
    const y = Math.sin((angle * Math.PI) / 180) * radius
    return { x, y }
  }

  const getFoodButtonClass = (foodName: string) => {
    const baseClass =
      "absolute w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg touch-manipulation"

    let statusClass = ""
    if (animalPredictions.includes(foodName)) {
      statusClass = "ring-8 ring-red-600 shadow-red-600/90 bg-red-800/50 animate-bounce scale-110 sm:scale-125 z-20"
    } else if (selectedFood === foodName) {
      statusClass = "ring-4 ring-blue-500 shadow-blue-500/50 scale-105 sm:scale-110"
    } else if (highlightedFoods.includes(foodName)) {
      statusClass = "ring-4 ring-yellow-400 shadow-yellow-400/60 animate-pulse"
    } else if (hoveredFood === foodName) {
      statusClass = "ring-2 ring-white/50 shadow-white/30"
    }

    return `${baseClass} ${statusClass}`
  }

  const isAnimalFood = (foodName: string) => {
    const animalFoods = ["كتكوت", "بقره", "سمكة", "جمبري"]
    return animalFoods.includes(foodName)
  }

  const handleFoodClick = (foodName: string) => {
    if (onSequenceClick) {
      onSequenceClick(foodName)
    }
    onFoodClick(foodName)
  }

  return (
    <div className="relative flex items-center justify-center w-full max-w-fit mx-auto">
      {/* Food Wheel Background */}
      <div className="relative">
        <img
          src="/عجلة_الطعام.png"
          alt="Food Wheel"
          className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem] xl:w-[32rem] xl:h-[32rem] drop-shadow-2xl"
        />

        {/* Wheel Items positioned around the circle */}
        {foods.map((food) => {
          const positionSm = getClockPosition(food.position!, "sm")
          const positionMd = getClockPosition(food.position!, "md")
          const positionLg = getClockPosition(food.position!, "lg")

          return (
            <button
              key={food.name}
              onClick={() => handleFoodClick(food.name)}
              onMouseEnter={() => setHoveredFood(food.name)}
              onMouseLeave={() => setHoveredFood(null)}
              className={getFoodButtonClass(food.name)}
              style={
                {
                  "--pos-sm-x": `${positionSm.x}px`,
                  "--pos-sm-y": `${positionSm.y}px`,
                  "--pos-md-x": `${positionMd.x}px`,
                  "--pos-md-y": `${positionMd.y}px`,
                  "--pos-lg-x": `${positionLg.x}px`,
                  "--pos-lg-y": `${positionLg.y}px`,
                  left: `calc(50% + var(--pos-sm-x) - 20px)`,
                  top: `calc(50% + var(--pos-sm-y) - 20px)`,
                } as React.CSSProperties
              }
              disabled={isLoading}
              aria-label={`اختر ${food.name}`}
            >
              <img
                src={food.image || "/placeholder.svg"}
                alt={food.name}
                className="w-full h-full object-cover rounded-full border-2 border-white/80"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/diverse-food-spread.png"
                }}
              />

              {animalPredictions.includes(food.name) && isAnimalFood(food.name) && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-600/80 rounded-full animate-pulse">
                  <div className="text-white font-bold text-xs sm:text-sm md:text-base lg:text-lg">🎯</div>
                </div>
              )}

              {animalPredictions.includes(food.name) && (
                <div className="absolute -top-8 sm:-top-10 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs sm:text-sm px-3 py-1 rounded-full font-bold animate-bounce z-30 shadow-lg">
                  لحوم
                </div>
              )}

              {hoveredFood === food.name && !animalPredictions.includes(food.name) && (
                <div className="absolute -bottom-6 sm:-bottom-8 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs sm:text-sm px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                  {food.name}
                </div>
              )}
            </button>
          )
        })}

        {/* Bottom Food Items */}
        {bottomFoods.map((food) => (
          <button
            key={food.name}
            onClick={() => handleFoodClick(food.name)}
            onMouseEnter={() => setHoveredFood(food.name)}
            onMouseLeave={() => setHoveredFood(null)}
            className={getFoodButtonClass(food.name)}
            style={{
              [food.side!]: "5px",
              bottom: "5px",
            }}
            disabled={isLoading}
            aria-label={`اختر ${food.name}`}
          >
            <img
              src={food.image || "/placeholder.svg"}
              alt={food.name}
              className="w-full h-full object-cover rounded-full border-2 border-white/80"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/diverse-food-spread.png"
              }}
            />

            {animalPredictions.includes(food.name) && isAnimalFood(food.name) && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-600/80 rounded-full animate-pulse">
                <div className="text-white font-bold text-xs sm:text-sm md:text-base lg:text-lg">🎯</div>
              </div>
            )}

            {animalPredictions.includes(food.name) && (
              <div className="absolute -top-8 sm:-top-10 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs sm:text-sm px-3 py-1 rounded-full font-bold animate-bounce z-30 shadow-lg">
                لحوم
              </div>
            )}

            {hoveredFood === food.name && !animalPredictions.includes(food.name) && (
              <div className="absolute -top-6 sm:-top-8 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs sm:text-sm px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                {food.name}
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnalogClock />
      </div>

      <style jsx>{`
        @media (min-width: 640px) {
          button {
            left: calc(50% + var(--pos-sm-x) - 24px) !important;
            top: calc(50% + var(--pos-sm-y) - 24px) !important;
          }
        }
        @media (min-width: 768px) {
          button {
            left: calc(50% + var(--pos-md-x) - 32px) !important;
            top: calc(50% + var(--pos-md-y) - 32px) !important;
          }
        }
        @media (min-width: 1024px) {
          button {
            left: calc(50% + var(--pos-lg-x) - 40px) !important;
            top: calc(50% + var(--pos-lg-y) - 40px) !important;
          }
        }
      `}</style>
    </div>
  )
}
