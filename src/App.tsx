import { useState } from "react"
import { Button } from "@/components/ui/button"

const App = () => {

  const [count, setCount] = useState<number>(0);

  const handleCount = () => {
    setCount(count + 1);
  }

  return (
    <div className="h-screen flex justify-center items-center">
      <div className="flex flex-col gap-8">  
        <div className="flex items-center gap-2">
          <h1 className="text-xs font-semibold text-neutral-400 tracking-wider">maomao stack</h1>
          <p className="text-xs font-semibold text-neutral-400 tracking-wider">-</p>
          <p className="text-xs font-semibold text-neutral-400 tracking-wider">{count}</p>
        </div>
        <div className="flex flex-row items-start gap-12">
          <div className="flex flex-col gap-2">
            <h2 className="text-4xl font-semibold">vite</h2>
            <h2 className="text-4xl font-semibold">react</h2>
            <h2 className="text-4xl font-semibold">typescript</h2>
            <h2 className="text-4xl font-semibold">tailwind</h2>
            <h2 className="text-4xl font-semibold">shadcn</h2>
          </div>
          <div className="flex flex-col gap-6 items-end">
            <div className="flex flex-col gap-2 items-end">
              <p className="text-xs text-neutral-500">a project starter by maomao</p>
              <p className="text-[0.55rem] text-neutral-700 font-medium italic">for humay</p>
            </div>
            <Button 
              onClick={handleCount} 
              className="text-[0.7rem] font-medium h-7 w-16 rounded-md cursor-pointer"
              variant="default"
            >Click me</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
