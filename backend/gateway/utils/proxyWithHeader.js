import proxy from "express-http-proxy"

export const proxyWithHeader = (serviceUrl) => {
    return proxy(serviceUrl, {
        limit: '50mb', // Add this line to allow larger payloads
        proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
            if (srcReq.user) {
                // Safely convert to String just in case userId is an ObjectId
                proxyReqOpts.headers["x-user-id"] = String(srcReq.user.userId || srcReq.user._id);
            }
            
            return proxyReqOpts; 
        }
    })
}