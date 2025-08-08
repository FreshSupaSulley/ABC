import BigBox from "../components/BigBox"

function NotFound() {
    return <BigBox sx={{ textAlign: 'center' }}>
        <h1>404 (Not Found)</h1>
        <p>The page you're looking for doesn't exist.</p>
    </BigBox>
}

export default NotFound