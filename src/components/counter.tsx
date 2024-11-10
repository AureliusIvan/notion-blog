import React, {useState} from 'react'

interface CounterProps {
  initialValue: number;
}

const Counter = ({initialValue}: CounterProps) => {
  const [clicks, setClicks] = useState(initialValue)

  return (
      <div style={{margin: '10px 0 20px'}}>
        <p>Count: {clicks}</p>
        <button onClick={() => setClicks(clicks + 1)}>increase count</button>
        <button onClick={() => setClicks(clicks - 1)}>decrease count</button>
      </div>
  )
}

export default Counter
