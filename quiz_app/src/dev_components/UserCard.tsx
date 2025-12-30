function UserCard() {
    const user = {
        name: "John Doe",
        year: 28,
        email: "john.doe@example.com",
        avatar: "https://via.placeholder.com/100"
    };

    const cardStyle = {
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        maxWidth: '300px',
        textAlign: 'center' as const
    }

    return (
        <div style={cardStyle}>
            <img
                src={user.avatar}
                alt={user.name}
                style={{ borderRadius: "50%" }}
            />
            <h2>{user.name}</h2>
            <p>{user.year}歳</p>
            <p>{user.email}</p>
        </div>
    )
}

export default UserCard