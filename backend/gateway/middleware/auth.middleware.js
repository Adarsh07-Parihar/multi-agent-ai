import redis from "../../shared/redis/redis.js"

const protect = async (req, res, next) => {
    try {
        const sessionId = req.cookies?.session
        
        // 1. Check if cookie exists. If not, stop here.
        if (!sessionId) {
            return res.status(401).json({ message: "Unauthorized: No session cookie found" })
        }

        // 2. Fetch the session from Redis (Now outside the if block so it actually runs)
        const session = await redis.get(`session-${sessionId}`)
        if (!session) {
            return res.status(401).json({ message: "Unauthorized: Session expired or invalid" })
        }

        // 3. Attach user data to request object and move to the next controller
        req.user = JSON.parse(session)
        next()

    } catch (error) {
         return res.status(500).json({ message: `protect error ${error.message || error}` })
    }
}

export default protect