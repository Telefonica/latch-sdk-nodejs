/*
 * Latch NodeJS SDK
 * Copyright (C) 2023 Telefonica Digital

 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.

 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.

 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */

API_VERSION = "1.3"

var config = {
    appId: '',
    secretKey: '',
    
    API_HOST: "https://latch.telefonica.com:443",
    API_CHECK_STATUS_URL: "/api/" + API_VERSION + "/status",
    API_PAIR_URL: "/api/" + API_VERSION + "/pair",
    API_PAIR_WITH_ID_URL: "/api/" + API_VERSION + "/pairWithId",
    API_UNPAIR_URL: "/api/" + API_VERSION + "/unpair",
    API_LOCK_URL: "/api/" + API_VERSION + "/lock",
    API_UNLOCK_URL: "/api/" + API_VERSION + "/unlock",
    API_HISTORY_URL: "/api/" + API_VERSION + "/history",
    API_OPERATION_URL: "/api/" + API_VERSION + "/operation",
    API_SUBSCRIPTION_URL: "/api/" + API_VERSION + "/subscription",
    API_APPLICATION_URL: "/api/" + API_VERSION + "/application",
    API_INSTANCE_URL: "/api/" + API_VERSION + "/instance",
    
    AUTHORIZATION_HEADER_NAME: "Authorization",
    DATE_HEADER_NAME: "X-11Paths-Date",
    PLUGIN_HEADER_NAME: "Latch-Plugin-Name",
    AUTHORIZATION_METHOD: "11PATHS",
    AUTHORIZATION_HEADER_FIELD_SEPARATOR: " ",

    UTC_STRING_FORMAT: "%Y-%m-%d %H:%M:%S",
    
    X_11PATHS_HEADER_PREFIX: "X-11paths-",
    X_11PATHS_HEADER_SEPARATOR: ":",
};

module.exports = config;
