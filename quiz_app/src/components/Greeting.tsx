// Props の型を定義
type GreetingProps = {
  name: string
}

function Greeting(props: GreetingProps): JSX.Element {
  return <p>こんにちは、{props.name}さん！</p>
}

export default Greeting