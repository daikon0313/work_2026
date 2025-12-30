import { useState } from 'react'

function UseState(): JSX.Element {
  const [name, setName] = useState('')

return (
    <div>
        <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
        />
        <p>こんにちは、{name}さん！</p>
    </div>
  )
}

export default UseState