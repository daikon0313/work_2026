import Profile from "./Profiles"

function Card() {
    return (
        <div style={{ border: "2px solid #ccc", padding: "10px", borderRadius: "5px" }}>
            <h1>カード</h1>
            <Profile />
        </div>
    )
}

export default Card;