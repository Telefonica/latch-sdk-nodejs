var config = {
    appId: '',
    secretKey: '',
    API_HOST: "latch.elevenpaths.com",
    API_PORT: "443",
    API_CHECK_STATUS_URL:"/api/0.7/status",
    API_PAIR_URL:"/api/0.7/pair",
    API_PAIR_WITH_ID_URL:"/api/0.7/pairWithId",
    API_UNPAIR_URL:"/api/0.7/unpair",
    
    AUTHORIZATION_HEADER_NAME:"Authorization",
    DATE_HEADER_NAME:"X-11Paths-Date",
    AUTHORIZATION_METHOD: "11PATHS",
    AUTHORIZATION_HEADER_FIELD_SEPARATOR: " ",

    UTC_STRING_FORMAT: "%Y-%m-%d %H:%M:%S",
    
    X_11PATHS_HEADER_PREFIX: "X-11paths-",
    X_11PATHS_HEADER_SEPARATOR: ":",
};

module.exports = config;