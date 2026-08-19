import api from "../../utils/axios.js"

const getCurrentUser = async () => {
    try {
        const { data } = await api.get("/api/me")
        console.log(data)
        return data; 
    } catch (error) {
        console.error("Error fetching current user:", error.response?.data || error.message)
        throw error;
        return null
    }
}

export default getCurrentUser